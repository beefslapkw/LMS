<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class ReturnTransaction{
        function getAllReturnTransactions(){
            include "connection.php";

            $sql = "SELECT ri.return_item_id, ri.condition_notes,
                        rt.return_transaction_id, rt.returned_at,
                        bi.borrow_item_id, bi.expires_at,
                        bc.copy_id, bc.accession_number,
                        b.book_title,
                        c.condition_desc,
                        borrower.user_id AS borrower_id, borrower.first_name AS borrower_first_name, borrower.last_name AS borrower_last_name,
                        receiver.first_name AS received_by_first_name, receiver.last_name AS received_by_last_name
                FROM return_items ri
                INNER JOIN return_transactions rt ON ri.return_transaction_id = rt.return_transaction_id
                INNER JOIN borrow_items bi ON ri.borrow_item_id = bi.borrow_item_id
                INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                INNER JOIN book_copies bc ON bi.copy_id = bc.copy_id
                INNER JOIN books b ON bc.book_id = b.book_id
                INNER JOIN conditions c ON ri.condition_on_return = c.condition_id
                INNER JOIN users borrower ON bt.borrower_id = borrower.user_id
                INNER JOIN users receiver ON rt.received_by = receiver.user_id
                ORDER BY rt.returned_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addReturnTransaction($json){
            include "connection.php";

            $json = json_decode($json, true);

            $header = $json['header'];
            $details = $json['details'];

            try{
                $conn->beginTransaction();

                $sql = "INSERT INTO return_transactions(received_by, returned_at)
                        VALUES(:received_by, NOW())";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":received_by", $header['received_by']);
                $stmt->execute();
                $newId = $conn->lastInsertId();

                //para sa borrow item, kwaon ang copy id para ichange ang status after tas pang calculate sad sa fine
                $sqlBorrow = "SELECT copy_id, expires_at FROM borrow_items
                            WHERE borrow_item_id=:borrow_item_id AND is_returned=0";
                $stmtBorrow = $conn->prepare($sqlBorrow);

                $sqlItem = "INSERT INTO return_items(return_transaction_id, borrow_item_id, condition_on_return, condition_notes)
                            VALUES(:return_transaction_id, :borrow_item_id, :condition_on_return, :condition_notes)";
                $stmtItem = $conn->prepare($sqlItem);

                $sqlMarkReturned = "UPDATE borrow_items SET is_returned=1 WHERE borrow_item_id=:borrow_item_id";
                $stmtMarkReturned = $conn->prepare($sqlMarkReturned);

                $sqlStatus = "UPDATE book_copies SET status_id=1 WHERE copy_id=:copy_id"; 
                $stmtStatus = $conn->prepare($sqlStatus);

                $sqlFine = "INSERT INTO fine_records(borrow_item_id, days_late, fine_amount, is_paid)
                            VALUES(:borrow_item_id, :days_late, :fine_amount, 0)";
                $stmtFine = $conn->prepare($sqlFine);

                foreach($details as $row){
                    $stmtBorrow->bindParam(":borrow_item_id", $row['borrow_item_id']);
                    $stmtBorrow->execute();
                    $borrowInfo = $stmtBorrow->fetch(PDO::FETCH_ASSOC);

                    if(!$borrowInfo){
                        $conn->rollBack();
                        return json_encode("One or more items are already returned or invalid");
                    }

                    $stmtItem->bindParam(":return_transaction_id", $newId);
                    $stmtItem->bindParam(":borrow_item_id", $row['borrow_item_id']);
                    $stmtItem->bindParam(":condition_on_return", $row['condition_on_return']);
                    $stmtItem->bindParam(":condition_notes", $row['condition_notes']);
                    $stmtItem->execute();

                    $stmtMarkReturned->bindParam(":borrow_item_id", $row['borrow_item_id']);
                    $stmtMarkReturned->execute();

                    $stmtStatus->bindParam(":copy_id", $borrowInfo['copy_id']);
                    $stmtStatus->execute();

                    //computation sa fine
                    $today = new DateTime();
                    $dueDate = new DateTime($borrowInfo['expires_at']);
                    $daysLate = 0;
                    if($today > $dueDate){
                        $daysLate = $today->diff($dueDate)->days;
                    }

                    if($daysLate > 0){
                        $fineAmount = $daysLate * 5; 
                        $stmtFine->bindParam(":borrow_item_id", $row['borrow_item_id']);
                        $stmtFine->bindParam(":days_late", $daysLate);
                        $stmtFine->bindParam(":fine_amount", $fineAmount);
                        $stmtFine->execute();
                    }
                }

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

    $returntransaction = new ReturnTransaction();
    switch($operation){
        case "getAllReturnTransactions":
            echo $returntransaction->getAllReturnTransactions();
            break;
        case "addReturnTransaction":
            echo $returntransaction->addReturnTransaction($json);
            break;
    }
?>