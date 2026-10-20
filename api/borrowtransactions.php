<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    require_once "reservationhelpers.php";

    class BorrowTransaction{
        function getAllBorrowTransactions($json){
            include "connection.php";

            $json = json_decode($json ?? '{}', true) ?: [];

            $statusConditions = [
                'active'      => "bi.is_returned = 0 AND bi.expires_at >= NOW()",
                'overdue'     => "bi.is_returned = 0 AND bi.expires_at < NOW()",
                'returned'    => "bi.is_returned = 1",
                'outstanding' => "bi.is_returned = 0",   //active ug overdue (para sa Return/Renew, dili paginated)
                'all'         => "1 = 1"
            ];
            $status = $json['status'] ?? 'active';
            if(!isset($statusConditions[$status])){
                $status = 'active';
            }
            $where = $statusConditions[$status];
            $paginate = $status !== 'outstanding';

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;

            $sqlCount = "SELECT COUNT(*) FROM borrow_items bi WHERE $where";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            if($paginate){
                $totalPages = max(1, (int)ceil($totalRows / $limit));
                $page = min($page, $totalPages);   
                $offset = ($page - 1) * $limit;
            }
            else{
                $totalPages = 1;
                $page = 1;
                $limit = $totalRows;
            }

            $sql = "SELECT bi.borrow_item_id, bi.expires_at, bi.is_returned,
                        CASE
                            WHEN bi.is_returned = 1 THEN 'returned'
                            WHEN bi.expires_at < NOW() THEN 'overdue'
                            ELSE 'active'
                        END AS status,
                        bt.transaction_id, bt.borrowed_at,
                        bc.copy_id, bc.accession_number,
                        b.book_title,
                        borrower.user_id AS borrower_id, borrower.first_name AS borrower_first_name, borrower.last_name AS borrower_last_name,
                        processor.first_name AS processed_by_first_name, processor.last_name AS processed_by_last_name
                FROM borrow_items bi
                INNER JOIN borrow_transactions bt ON bi.transaction_id=bt.transaction_id
                INNER JOIN book_copies bc ON bi.copy_id=bc.copy_id
                INNER JOIN books b ON bc.book_id=b.book_id
                INNER JOIN users borrower ON bt.borrower_id=borrower.user_id
                INNER JOIN users processor ON bt.processed_by=processor.user_id
                WHERE $where
                ORDER BY bt.borrowed_at DESC, bi.borrow_item_id DESC";
            if($paginate){
                $sql .= " LIMIT :limit OFFSET :offset";
            }

            $stmt = $conn->prepare($sql);
            if($paginate){
                $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
                $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
            }
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
        function addBorrowTransaction($json){
            include "connection.php";

            $json = json_decode($json, true);
        
            $header = $json['header'];
            $header['processed_by'] = currentUserId();   //gikan sa session
            $details = $json['details'];
        
            try{
                $conn->beginTransaction();

                //NEW: i-expire una ang lapas na nga reservations para up to date ang status sa mga copies
                expireReservations($conn);

                //NEW: IDs para sa reservation pickup
                $reservedId  = getCopyStatusId($conn, 'Reserved');
                $activeResId = getReservationStatusId($conn, 'Active');
                $fulfilledId = getReservationStatusId($conn, 'Fulfilled');

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
                    return json_encode("Borrow failed, user has unpaid fines");
                }
        
                $sqlRole = "SELECT r.role_type,
                                (SELECT COUNT(*) FROM borrow_items bi
                                INNER JOIN borrow_transactions bt ON bi.transaction_id=bt.transaction_id
                                WHERE bt.borrower_id = :user_id AND bi.is_returned = 0) AS activeCount
                            FROM users u
                            INNER JOIN roles r ON u.role_id = r.role_id
                            WHERE u.user_id=:user_id";
                $stmtRole = $conn->prepare($sqlRole);
                $stmtRole->bindParam(":user_id", $header['borrower_id']);
                $stmtRole->execute();
                $borrowerInfo = $stmtRole->fetch(PDO::FETCH_ASSOC);
        
                $limit = ($borrowerInfo['role_type'] == "Faculty") ? 10 : 3;
                if($borrowerInfo['activeCount'] + count($details) > $limit){
                    $conn->rollBack();
                    return json_encode("Borrow limit exceeded");
                }
        
                $sql = "INSERT INTO borrow_transactions(borrower_id, processed_by, borrowed_at)
                        VALUES(:borrower_id, :processed_by, NOW())";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":borrower_id", $header['borrower_id']);
                $stmt->bindParam(":processed_by", $header['processed_by']);
                $stmt->execute();
                $newId = $conn->lastInsertId();
        
                //kwaon ang borrow_duration sa category sa book (in days)
                //NEW: FOR UPDATE para di maagawan ang copy sa lain nga transaction
                $sqlCopy = "SELECT c.borrow_duration, bc.status_id
                        FROM book_copies bc
                        INNER JOIN books b ON bc.book_id=b.book_id
                        INNER JOIN categories c ON b.category_id=c.category_id
                        WHERE bc.copy_id=:copy_id
                        FOR UPDATE";
                $stmtCopy = $conn->prepare($sqlCopy);

                //NEW: Active nga reservation sa copy nga iya sa borrower
                $sqlResCheck = "SELECT ri.reservation_item_id
                        FROM reservation_items ri
                        INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                        WHERE ri.copy_id=:copy_id
                        AND rt.borrower_id=:borrower_id
                        AND ri.reservation_status_id=:active_id
                        AND rt.expires_at >= NOW()
                        LIMIT 1
                        FOR UPDATE";
                $stmtResCheck = $conn->prepare($sqlResCheck);

                //NEW: i-link ang reservation item sa borrow item ug markahan nga Fulfilled
                $sqlResFulfill = "UPDATE reservation_items
                        SET borrow_item_id=:borrow_item_id, reservation_status_id=:fulfilled_id
                        WHERE reservation_item_id=:reservation_item_id";
                $stmtResFulfill = $conn->prepare($sqlResFulfill);
        
                $sqlStatus = "UPDATE book_copies SET status_id=2 WHERE copy_id=:copy_id"; 
                $stmtStatus = $conn->prepare($sqlStatus);
        
                //faculty kay fixed gihapon 3 months
                $sqlDtlFaculty = "INSERT INTO borrow_items(transaction_id, copy_id, expires_at, is_returned)
                            VALUES(:transaction_id, :copy_id, DATE_ADD(NOW(), INTERVAL 3 MONTH), 0)";
                //ang uban kay based sa borrow_duration sa category
                $sqlDtl = "INSERT INTO borrow_items(transaction_id, copy_id, expires_at, is_returned)
                            VALUES(:transaction_id, :copy_id, DATE_ADD(NOW(), INTERVAL :duration DAY), 0)";
        
                $stmtDtlFaculty = $conn->prepare($sqlDtlFaculty);
                $stmtDtl = $conn->prepare($sqlDtl);
        
                foreach($details as $row){
                    $stmtCopy->bindParam(":copy_id", $row['copy_id']);
                    $stmtCopy->execute();
                    $copyInfo = $stmtCopy->fetch(PDO::FETCH_ASSOC);

                    if(!$copyInfo){
                        $conn->rollBack();
                        return json_encode("One or more copies are no longer available");
                    }

                    //NEW: ang Reserved nga copy pwede ra ma-borrow sa naka-reserve
                    $reservationItemId = null;
                    if($reservedId && $copyInfo['status_id'] == $reservedId){
                        $stmtResCheck->bindValue(":copy_id", $row['copy_id']);
                        $stmtResCheck->bindValue(":borrower_id", $header['borrower_id']);
                        $stmtResCheck->bindValue(":active_id", $activeResId, PDO::PARAM_INT);
                        $stmtResCheck->execute();
                        $reservationItemId = $stmtResCheck->fetchColumn();

                        if(!$reservationItemId){
                            $conn->rollBack();
                            return json_encode("One or more copies are reserved for another borrower");
                        }
                    }
                    elseif($copyInfo['status_id'] != 1){ 
                        $conn->rollBack();
                        return json_encode("One or more copies are no longer available");
                    }
        
                    if($borrowerInfo['role_type'] == "Faculty"){
                        $stmtDtlFaculty->bindValue(":transaction_id", $newId);
                        $stmtDtlFaculty->bindValue(":copy_id", $row['copy_id']);
                        $stmtDtlFaculty->execute();
                    }
                    else{
                        $duration = (int)$copyInfo['borrow_duration'];

                        //guard para di ma overdue kung walay duration ang category
                        if($duration <= 0){
                            $conn->rollBack();
                            return json_encode("This book's category has no borrow duration set");
                        }

                        $stmtDtl->bindValue(":transaction_id", $newId);
                        $stmtDtl->bindValue(":copy_id", $row['copy_id']);
                        $stmtDtl->bindValue(":duration", $duration, PDO::PARAM_INT);
                        $stmtDtl->execute();
                    }
                    //NEW: kwaon ang ID sa bag-ong borrow item (kinahanglan para sa link sa reservation)
                    $newBorrowItemId = $conn->lastInsertId();

                    if($reservationItemId){
                        $stmtResFulfill->bindValue(":borrow_item_id", $newBorrowItemId);
                        $stmtResFulfill->bindValue(":fulfilled_id", $fulfilledId, PDO::PARAM_INT);
                        $stmtResFulfill->bindValue(":reservation_item_id", $reservationItemId);
                        $stmtResFulfill->execute();
                    }
        
                    $stmtStatus->bindValue(":copy_id", $row['copy_id']);
                    $stmtStatus->execute();
                }
        
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

    $borrowtransaction = new BorrowTransaction();
    switch($operation){
        case "getAllBorrowTransactions":
            echo $borrowtransaction->getAllBorrowTransactions($json);
            break;
        case "addBorrowTransaction":
            echo $borrowtransaction->addBorrowTransaction($json);
            break;
    }
?>