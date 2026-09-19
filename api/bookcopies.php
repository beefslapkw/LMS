<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class BookCopy{
        function getAllCopies(){
            include "connection.php";

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
                ORDER BY bc.accession_number";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addCopy($json){
            include "connection.php";

            $json = json_decode($json, true);

            $qty = $json['qty'];

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

            try{
                $conn->beginTransaction();

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
                $conn->rollBack();
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

    $bookcopy = new BookCopy();
    switch($operation){
        case "getAllCopies":
            echo $bookcopy->getAllCopies();
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
    }
?>