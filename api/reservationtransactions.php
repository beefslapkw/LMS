<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    require_once "reservationhelpers.php";

    class ReservationTransaction{
        //gamit sa librarian (tanan) ug sa student (i-pass ang borrower_id para sa iyang reservations ra)
        function getAllReservations($json){
            include "connection.php";

            $json = json_decode($json ?? '{}', true) ?: [];

            //student/faculty: ilang reservations ra
            if(in_array(currentRoleId(), BORROWERS, true)){
                $json['borrower_id'] = currentUserId();
            }

            try{
                expireReservations($conn);
            }
            catch(Exception $e){
                //ayaw i-block ang listing kung naguba ang expiry
            }

            $statusMap = [
                'active'    => 'Active',
                'fulfilled' => 'Fulfilled',
                'cancelled' => 'Cancelled',
                'expired'   => 'Expired'
            ];
            $status = $json['status'] ?? 'active';

            $where = [];
            $params = [];
            if(isset($statusMap[$status])){
                $where[] = "rs.reservation_status_desc = :status_desc";
                $params[':status_desc'] = $statusMap[$status];
            }
            if(!empty($json['borrower_id'])){
                $where[] = "rt.borrower_id = :borrower_id";
                $params[':borrower_id'] = $json['borrower_id'];
            }
            $whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;

            $sqlCount = "SELECT COUNT(*)
                        FROM reservation_items ri
                        INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                        INNER JOIN reservation_statuses rs ON ri.reservation_status_id=rs.reservation_status_id
                        $whereSql";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute($params);
            $totalRows = (int)$stmtCount->fetchColumn();

            $totalPages = max(1, (int)ceil($totalRows / $limit));
            $page = min($page, $totalPages);
            $offset = ($page - 1) * $limit;

            $sql = "SELECT ri.reservation_item_id, ri.borrow_item_id,
                        rt.reservation_id, rt.reserved_at, rt.expires_at,
                        rs.reservation_status_desc,
                        bc.copy_id, bc.accession_number,
                        b.book_title,
                        borrower.user_id AS borrower_id, borrower.first_name AS borrower_first_name, borrower.last_name AS borrower_last_name
                    FROM reservation_items ri
                    INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                    INNER JOIN reservation_statuses rs ON ri.reservation_status_id=rs.reservation_status_id
                    INNER JOIN book_copies bc ON ri.copy_id=bc.copy_id
                    INNER JOIN books b ON bc.book_id=b.book_id
                    INNER JOIN users borrower ON rt.borrower_id=borrower.user_id
                    $whereSql
                    ORDER BY rt.reserved_at DESC, ri.reservation_item_id DESC
                    LIMIT :limit OFFSET :offset";
            $stmt = $conn->prepare($sql);
            foreach($params as $key => $value){
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode([
                "data" => $rs,
                "total" => $totalRows,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => $totalPages
            ]);
        }

        //gamit sa borrow modal: naay Active nga reservation ba ning copy para ani nga borrower?
        function getReservationForCopy($json){
            include "connection.php";

            $json = json_decode($json, true);

            try{
                expireReservations($conn);
            }
            catch(Exception $e){
            }

            $sql = "SELECT ri.reservation_item_id, rt.expires_at
                    FROM reservation_items ri
                    INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                    INNER JOIN reservation_statuses rs ON ri.reservation_status_id=rs.reservation_status_id
                    WHERE ri.copy_id=:copy_id
                    AND rt.borrower_id=:borrower_id
                    AND rs.reservation_status_desc='Active'
                    AND rt.expires_at >= NOW()
                    LIMIT 1";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":copy_id", $json['copy_id']);
            $stmt->bindParam(":borrower_id", $json['borrower_id']);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($row ?: null);
        }

        //details = [{book_id: 1}, {book_id: 5}] - ang server ra ang mopili sa Available nga copy
        function addReservation($json){
            include "connection.php";

            $json = json_decode($json, true);

            $json['header']['borrower_id'] = currentUserId();   //gikan sa session
            $header = $json['header'];
            $details = $json['details'];

            if(!is_array($details) || count($details) == 0){
                return json_encode("Please select at least one book");
            }

            try{
                $conn->beginTransaction();

                expireReservations($conn);

                $availableId = getCopyStatusId($conn, 'Available');
                $reservedId  = getCopyStatusId($conn, 'Reserved');
                $activeId    = getReservationStatusId($conn, 'Active');

                if(!$reservedId || !$activeId){
                    $conn->rollBack();
                    return json_encode("Reservation statuses are not set up yet");
                }

                //parehas sa borrow: bawal mag-reserve kung naay unpaid fines
                $sqlFineCheck = "SELECT COUNT(*) AS unpaidCount
                        FROM fine_records fr
                        INNER JOIN borrow_items bi ON fr.borrow_item_id=bi.borrow_item_id
                        INNER JOIN borrow_transactions bt ON bi.transaction_id=bt.transaction_id
                        WHERE bt.borrower_id=:borrower_id AND fr.is_paid=0";
                $stmtFineCheck = $conn->prepare($sqlFineCheck);
                $stmtFineCheck->bindParam(":borrower_id", $header['borrower_id']);
                $stmtFineCheck->execute();
                $fineInfo = $stmtFineCheck->fetch(PDO::FETCH_ASSOC);

                if($fineInfo['unpaidCount'] > 0){
                    $conn->rollBack();
                    return json_encode("Reservation failed, user has unpaid fines");
                }

                //ang limit kay borrowed + reserved dili molapas sa 3 (student) / 10 (faculty)
                $sqlRole = "SELECT r.role_type,
                                (SELECT COUNT(*) FROM borrow_items bi
                                INNER JOIN borrow_transactions bt ON bi.transaction_id=bt.transaction_id
                                WHERE bt.borrower_id=:user_id AND bi.is_returned=0) AS activeBorrows,
                                (SELECT COUNT(*) FROM reservation_items ri
                                INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                                WHERE rt.borrower_id=:user_id AND ri.reservation_status_id=:active_id) AS activeReservations
                            FROM users u
                            INNER JOIN roles r ON u.role_id=r.role_id
                            WHERE u.user_id=:user_id";
                $stmtRole = $conn->prepare($sqlRole);
                $stmtRole->bindValue(":user_id", $header['borrower_id']);
                $stmtRole->bindValue(":active_id", $activeId, PDO::PARAM_INT);
                $stmtRole->execute();
                $borrowerInfo = $stmtRole->fetch(PDO::FETCH_ASSOC);

                if(!$borrowerInfo){
                    $conn->rollBack();
                    return json_encode("Borrower not found");
                }

                $limit = ($borrowerInfo['role_type'] == "Faculty") ? 10 : 3;
                if($borrowerInfo['activeBorrows'] + $borrowerInfo['activeReservations'] + count($details) > $limit){
                    $conn->rollBack();
                    return json_encode("Limit exceeded, borrowed and reserved books cannot go over $limit");
                }

                $expireDays = (int)RESERVATION_DAYS;
                $sql = "INSERT INTO reservation_transactions(borrower_id, reserved_at, expires_at)
                        VALUES(:borrower_id, NOW(), DATE_ADD(NOW(), INTERVAL $expireDays DAY))";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":borrower_id", $header['borrower_id']);
                $stmt->execute();
                $newId = $conn->lastInsertId();

                //bawal i-reserve ang parehas nga libro kung naa na siya'y Active reservation ana (parehas sa pag-reserve ug tanan copies)
                $sqlDup = "SELECT COUNT(*)
                        FROM reservation_items ri
                        INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                        INNER JOIN book_copies bc ON ri.copy_id=bc.copy_id
                        WHERE rt.borrower_id=:borrower_id AND bc.book_id=:book_id AND ri.reservation_status_id=:active_id";
                $stmtDup = $conn->prepare($sqlDup);

                //mopili ang server ug usa ka Available nga copy; FOR UPDATE para di maagawan sa lain nga request
                $sqlPick = "SELECT bc.copy_id, b.book_title
                        FROM book_copies bc
                        INNER JOIN books b ON bc.book_id=b.book_id
                        WHERE bc.book_id=:book_id AND b.is_active=1 AND bc.status_id=:available_id
                        ORDER BY bc.copy_id
                        LIMIT 1
                        FOR UPDATE";
                $stmtPick = $conn->prepare($sqlPick);

                $sqlItem = "INSERT INTO reservation_items(reservation_id, copy_id, reservation_status_id, borrow_item_id)
                            VALUES(:reservation_id, :copy_id, :active_id, NULL)";
                $stmtItem = $conn->prepare($sqlItem);

                $sqlStatus = "UPDATE book_copies SET status_id=:reserved_id WHERE copy_id=:copy_id";
                $stmtStatus = $conn->prepare($sqlStatus);

                foreach($details as $row){
                    $stmtDup->bindValue(":borrower_id", $header['borrower_id']);
                    $stmtDup->bindValue(":book_id", $row['book_id']);
                    $stmtDup->bindValue(":active_id", $activeId, PDO::PARAM_INT);
                    $stmtDup->execute();
                    if($stmtDup->fetchColumn() > 0){
                        $conn->rollBack();
                        return json_encode("You already have an active reservation for one of these books");
                    }

                    $stmtPick->bindValue(":book_id", $row['book_id']);
                    $stmtPick->bindValue(":available_id", $availableId, PDO::PARAM_INT);
                    $stmtPick->execute();
                    $copy = $stmtPick->fetch(PDO::FETCH_ASSOC);

                    if(!$copy){
                        $conn->rollBack();
                        return json_encode("No available copy for one of the selected books");
                    }

                    $stmtItem->bindValue(":reservation_id", $newId);
                    $stmtItem->bindValue(":copy_id", $copy['copy_id']);
                    $stmtItem->bindValue(":active_id", $activeId, PDO::PARAM_INT);
                    $stmtItem->execute();

                    $stmtStatus->bindValue(":reserved_id", $reservedId, PDO::PARAM_INT);
                    $stmtStatus->bindValue(":copy_id", $copy['copy_id']);
                    $stmtStatus->execute();
                }

                $conn->commit();

                pushWebSocketNotification('/api/notify-reservation', [
                    'reservation_id' => $newId,
                    'borrower_id'    => $header['borrower_id'],
                    'borrower_name'  => $_SESSION['fullname'] ?? 'Student/Faculty',
                    'book_count'     => count($details),
                    'timestamp'      => date('Y-m-d H:i:s')
                ]);
                
                $returnValue = 1;
            }
            catch(Exception $e){
                if($conn->inTransaction()){
                    $conn->rollBack();
                }
                $returnValue = 0;
            }
            return json_encode($returnValue);
        }

        //borrower_id optional: kung gi-pass (student side), check nga iya gyud ang reservation
        function cancelReservationItem($json){
            include "connection.php";

            $json = json_decode($json, true);

            try{
                $conn->beginTransaction();

                $availableId = getCopyStatusId($conn, 'Available');
                $reservedId  = getCopyStatusId($conn, 'Reserved');
                $activeId    = getReservationStatusId($conn, 'Active');
                $cancelledId = getReservationStatusId($conn, 'Cancelled');

                $sql = "SELECT ri.copy_id, rt.borrower_id
                        FROM reservation_items ri
                        INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                        WHERE ri.reservation_item_id=:reservation_item_id AND ri.reservation_status_id=:active_id
                        FOR UPDATE";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(":reservation_item_id", $json['reservation_item_id']);
                $stmt->bindValue(":active_id", $activeId, PDO::PARAM_INT);
                $stmt->execute();
                $item = $stmt->fetch(PDO::FETCH_ASSOC);

                if(!$item){
                    $conn->rollBack();
                    return json_encode("This reservation is no longer active");
                }
                if(in_array(currentRoleId(), BORROWERS, true) && (int)$item['borrower_id'] !== currentUserId()){
                    $conn->rollBack();
                    return json_encode("You can only cancel your own reservations");
                }

                $sqlCancel = "UPDATE reservation_items SET reservation_status_id=:cancelled_id WHERE reservation_item_id=:reservation_item_id";
                $stmtCancel = $conn->prepare($sqlCancel);
                $stmtCancel->bindValue(":cancelled_id", $cancelledId, PDO::PARAM_INT);
                $stmtCancel->bindValue(":reservation_item_id", $json['reservation_item_id']);
                $stmtCancel->execute();

                //ibalik sa Available ang copy (kung reserved pa)
                $sqlCopy = "UPDATE book_copies SET status_id=:available_id WHERE copy_id=:copy_id AND status_id=:reserved_id";
                $stmtCopy = $conn->prepare($sqlCopy);
                $stmtCopy->bindValue(":available_id", $availableId, PDO::PARAM_INT);
                $stmtCopy->bindValue(":reserved_id", $reservedId, PDO::PARAM_INT);
                $stmtCopy->bindValue(":copy_id", $item['copy_id']);
                $stmtCopy->execute();

                $conn->commit();
                $returnValue = 1;
            }
            catch(Exception $e){
                if($conn->inTransaction()){
                    $conn->rollBack();
                }
                $returnValue = 0;
            }
            return json_encode($returnValue);
        }
    }

    if($_SERVER['REQUEST_METHOD'] == 'GET'){
        $operation = $_GET['operation'];
        $json = isset($_GET['json']) ? $_GET['json'] : "";
    }
    elseif($_SERVER['REQUEST_METHOD'] == 'POST'){
        $operation = $_POST['operation'];
        $json = isset($_POST['json']) ? $_POST['json'] : "";
    }

    $reservationtransaction = new ReservationTransaction();
    switch($operation){
        case "getAllReservations":
            echo $reservationtransaction->getAllReservations($json);
            break;
        case "getReservationForCopy":
            echo $reservationtransaction->getReservationForCopy($json);
            break;
        case "addReservation":
            echo $reservationtransaction->addReservation($json);
            break;
        case "cancelReservationItem":
            echo $reservationtransaction->cancelReservationItem($json);
            break;
    }
?>