<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class FineRecord{
        function getAllFines(){
            include "connection.php";

            $sql = "SELECT f.fine_id, f.days_late, f.fine_amount, f.is_paid, f.paid_at,
                        bi.borrow_item_id,
                        bc.accession_number,
                        b.book_title,
                        u.first_name, u.last_name
                FROM fine_records f
                INNER JOIN borrow_items bi ON f.borrow_item_id = bi.borrow_item_id
                INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                INNER JOIN book_copies bc ON bi.copy_id = bc.copy_id
                INNER JOIN books b ON bc.book_id = b.book_id
                INNER JOIN users u ON bt.borrower_id = u.user_id
                ORDER BY f.is_paid ASC, bt.borrowed_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }

        function payFine($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE fine_records SET is_paid=1, paid_at=NOW() WHERE fine_id=:fine_id AND is_paid=0";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":fine_id", $json['fine_id']);
            $stmt->execute();

            $returnValue = 0;
            if($stmt->rowCount() > 0){
                $returnValue = 1;
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

    $finerecord = new FineRecord();
    switch($operation){
        case "getAllFines":
            echo $finerecord->getAllFines();
            break;
        case "payFine":
            echo $finerecord->payFine($json);
            break;
    }
?>