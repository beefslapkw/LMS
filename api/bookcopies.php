<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    require_once "reservationhelpers.php";

    //students/faculty dili makakita sa staff names ug condition notes
    function hideStaffFields(array $rows){
        if(in_array(currentRoleId(), BORROWERS, true)){
            foreach($rows as &$r){
                unset($r['condition_notes'], $r['first_name'], $r['last_name'], $r['added_at']);
            }
            unset($r);
        }
        return $rows;
    }

    class BookCopy{
        function getAllCopies($json){
            include "connection.php";

            //i-expire una ang lapas na nga reservations para tarong ang status sa mga copies
            safeExpireReservations($conn);

            $json = json_decode($json, true);

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            //total count para sa ibuild nga pages sa frontend
            $sqlCount = "SELECT COUNT(*) FROM book_copies";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT bc.copy_id, bc.accession_number, bc.condition_notes, bc.added_at,
                        b.book_title,
                        s.status_desc,
                        c.condition_desc,
                        u.first_name, u.last_name
                    FROM book_copies bc
                    INNER JOIN books b ON bc.book_id = b.book_id
                    INNER JOIN statuses s ON bc.status_id = s.status_id
                    INNER JOIN conditions c ON bc.condition_id = c.condition_id
                    INNER JOIN users u ON bc.added_by = u.user_id
                    ORDER BY bc.accession_number
                    LIMIT :limit OFFSET :offset";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode([
                "data" => $rs,
                "total" => $totalRows,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => (int)ceil($totalRows / $limit)
            ]);
        }
        function addCopy($json){
            include "connection.php";

            $json = json_decode($json, true);

            $json['added_by'] = currentUserId();   //gikan sa session, dili sa client
            $qty = max(1, min(50, (int)$json['qty']));

            $sqlASC = "SELECT COALESCE(MAX(accession_number), 0) AS last_accession FROM book_copies";
            $stmtASC = $conn->prepare($sqlASC);
            $stmtASC->execute();
            $lastAccession = $stmtASC->fetchColumn();

            $sql = "INSERT INTO book_copies(book_id, accession_number, status_id, condition_id, condition_notes, added_by, added_at)
                VALUES(:book_id, :accession_number, 1, 1, NULL, :added_by, NOW())";
            $stmt = $conn->prepare($sql);

            for($i = 1; $i <= $qty; $i++){
                $currentAccession = $lastAccession + $i;

                $stmt->bindParam(":book_id", $json['book_id']);
                $stmt->bindParam(":accession_number", $currentAccession);
                $stmt->bindParam(":added_by", $json['added_by']);
                $stmt->execute();
            }

            $returnValue = 0;
            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }

            return json_encode($returnValue);
        }
        function getCopy($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT bc.copy_id, bc.accession_number, bc.condition_notes, bc.added_at, bc.condition_id,
                    b.book_title,
                    s.status_desc,
                    c.condition_desc,
                    u.first_name, u.last_name
                FROM book_copies bc
                INNER JOIN books b ON bc.book_id = b.book_id
                INNER JOIN statuses s ON bc.status_id = s.status_id
                INNER JOIN conditions c ON bc.condition_id = c.condition_id
                INNER JOIN users u ON bc.added_by = u.user_id
                WHERE bc.copy_id=:copy_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":copy_id", $json['copy_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateCopy($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE book_copies set condition_id=:condition_id, condition_notes=:condition_notes
                WHERE copy_id=:copy_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":copy_id", $json['copy_id']);
            $stmt->bindParam(":condition_id", $json['condition_id']);
            $stmt->bindParam(":condition_notes", $json['condition_notes']);
            $stmt->execute();

            $returnValue = 0;
            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }

            return json_encode($returnValue);
        }
        function disposeCopy($json){
            include "connection.php";

            $json = json_decode($json, true);
            $json['disposed_by'] = currentUserId();   //gikan sa session


            try{
                $conn->beginTransaction();

                //kung naay Active nga reservation aning copy, icancel kay dili na pwede ma-pickup
                $sqlCancelRes = "UPDATE reservation_items
                    SET reservation_status_id=:cancelled_id
                    WHERE copy_id=:copy_id AND reservation_status_id=:active_id";
                $stmtCancelRes = $conn->prepare($sqlCancelRes);
                $stmtCancelRes->bindValue(":cancelled_id", getReservationStatusId($conn, 'Cancelled'), PDO::PARAM_INT);
                $stmtCancelRes->bindValue(":active_id", getReservationStatusId($conn, 'Active'), PDO::PARAM_INT);
                $stmtCancelRes->bindValue(":copy_id", $json['copy_id']);
                $stmtCancelRes->execute();

                $sql = "UPDATE book_copies SET status_id=:status_id
                    WHERE copy_id=:copy_id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":copy_id", $json['copy_id']);
                $stmt->bindParam(":status_id", $json['status_id']);
                $stmt->execute();

                $sqlDispose = "INSERT INTO disposal_records(copy_id, reason_id, disposed_by, disposed_at, remarks)
                    VALUES(:copy_id, :reason_id, :disposed_by, NOW(), :remarks)";
                $stmtDispose = $conn->prepare($sqlDispose);
                $stmtDispose->bindParam(":copy_id", $json['copy_id']);
                $stmtDispose->bindParam(":reason_id", $json['reason_id']);
                $stmtDispose->bindParam(":disposed_by", $json['disposed_by']);
                $stmtDispose->bindParam(":remarks", $json['remarks']);
                $stmtDispose->execute();

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
        function getCopyByAccession($json){
            include "connection.php";

            //iexpire una ang lapas na nga reservations para tarong ang status sa mga copies
            safeExpireReservations($conn);

            $json = json_decode($json, true);

            $sql = "SELECT bc.copy_id, bc.accession_number, b.book_title, s.status_desc
                    FROM book_copies bc
                    INNER JOIN books b ON bc.book_id = b.book_id
                    INNER JOIN statuses s ON bc.status_id = s.status_id
                    WHERE bc.accession_number=:accession_number";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(":accession_number", $json['accession_number']);
            $stmt->execute();

            return json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }
        function searchCopies($json){
            include "connection.php";

            //iexpire una ang lapas na nga reservations para tarong ang status sa mga copies
            safeExpireReservations($conn);

            $json = json_decode($json, true);
            $search = isset($json['search']) ? trim($json['search']) : "";
            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            $joins = "FROM book_copies bc
                INNER JOIN books b ON bc.book_id = b.book_id
                INNER JOIN conditions c ON bc.condition_id = c.condition_id
                INNER JOIN statuses s ON bc.status_id = s.status_id
                INNER JOIN users u ON bc.added_by = u.user_id";

            $where = "WHERE (b.book_title LIKE :s1
                        OR bc.accession_number LIKE :s2
                        OR c.condition_desc LIKE :s3
                        OR bc.condition_notes LIKE :s4
                        OR s.status_desc LIKE :s5)";

            $like = "%" . $search . "%";

            $stmtCount = $conn->prepare("SELECT COUNT(*) $joins $where");
            for($i = 1; $i <= 5; $i++){
                $stmtCount->bindValue(":s$i", $like);
            }
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT bc.copy_id, b.book_title, bc.accession_number,
                        c.condition_desc, bc.condition_notes,
                        u.first_name, u.last_name, bc.added_at, s.status_desc
                    $joins $where
                    ORDER BY b.book_title, bc.accession_number
                    LIMIT :limit OFFSET :offset";
            $stmt = $conn->prepare($sql);
            for($i = 1; $i <= 5; $i++){
                $stmt->bindValue(":s$i", $like);
            }
            $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
            $stmt->execute();

            return json_encode([
                "data" => hideStaffFields($stmt->fetchAll(PDO::FETCH_ASSOC)),
                "total" => $totalRows,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => (int)ceil($totalRows / $limit)
            ]);
        }
        function getAvailableCount(){
            include "connection.php";

            //iexpire una ang lapas na nga reservations para tarong ang status sa mga copies
            safeExpireReservations($conn);

            $sql = "SELECT COUNT(*) FROM book_copies c
                JOIN statuses s ON s.status_id = c.status_id
                WHERE s.status_desc = 'Available'";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = (int)$stmt->fetchColumn();

            return json_encode($rs);
        }
        //available copies kada libro, para sa student catalog (Reserve button)
        function getAvailableCountsByBook($json){
            include "connection.php";

            safeExpireReservations($conn);

            $json = json_decode($json, true);
            $ids = array_values(array_filter(array_map('intval', $json['book_ids'] ?? [])));

            if(count($ids) == 0){
                return json_encode((object)[]);
            }

            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "SELECT bc.book_id, COUNT(*) AS available_count
                    FROM book_copies bc
                    INNER JOIN statuses s ON bc.status_id = s.status_id
                    WHERE s.status_desc = 'Available' AND bc.book_id IN ($placeholders)
                    GROUP BY bc.book_id";
            $stmt = $conn->prepare($sql);
            $stmt->execute($ids);

            $counts = [];
            foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row){
                $counts[$row['book_id']] = (int)$row['available_count'];
            }

            return json_encode((object)$counts);
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

    $bookcopy = new BookCopy();
    switch($operation){
        case "getAllCopies":
            echo $bookcopy->getAllCopies($json);
            break;
        case "addCopy":
            echo $bookcopy->addCopy($json);
            break;
        case "getCopy":
            echo $bookcopy->getCopy($json);
            break;
        case "updateCopy":
            echo $bookcopy->updateCopy($json);
            break;
        case "disposeCopy":
            echo $bookcopy->disposeCopy($json);
            break;
        case "getCopyByAccession":
            echo $bookcopy->getCopyByAccession($json);
            break;
        case "searchCopies":
            echo $bookcopy->searchCopies($json);
            break;
        case "getAvailableCount":
            echo $bookcopy->getAvailableCount();
            break;
        case "getAvailableCountsByBook":
            echo $bookcopy->getAvailableCountsByBook($json);
            break;
    }
?>