<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class RenewalRecord{
        function getAllRenewals(){
            include "connection.php";

            $sql = "SELECT rr.renewal_record_id, rr.old_due_date, rr.new_due_date, rr.renewed_at,
                        bi.borrow_item_id,
                        bc.accession_number,
                        b.book_title,
                        borrower.first_name AS borrower_first_name, borrower.last_name AS borrower_last_name,
                        renewer.first_name AS renewed_by_first_name, renewer.last_name AS renewed_by_last_name
                FROM renewal_records rr
                INNER JOIN borrow_items bi ON rr.borrow_item_id = bi.borrow_item_id
                INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                INNER JOIN book_copies bc ON bi.copy_id = bc.copy_id
                INNER JOIN books b ON bc.book_id = b.book_id
                INNER JOIN users borrower ON bt.borrower_id = borrower.user_id
                INNER JOIN users renewer ON rr.renewed_by = renewer.user_id
                ORDER BY rr.renewed_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }

        function addRenewal($json){
            include "connection.php";

            $json = json_decode($json, true);

            $borrowItemId = $json['borrow_item_id'];
            $renewedBy = $json['renewed_by'];

            try{
                $conn->beginTransaction();

                //di pwede mag renew kung nay fine
                $sqlFineCheck = "SELECT COUNT(*) AS unpaidCount FROM fine_records
                                WHERE borrow_item_id=:borrow_item_id AND is_paid=0";
                $stmtFineCheck = $conn->prepare($sqlFineCheck);
                $stmtFineCheck->bindParam(":borrow_item_id", $borrowItemId);
                $stmtFineCheck->execute();
                $fineInfo = $stmtFineCheck->fetch(PDO::FETCH_ASSOC);

                if($fineInfo['unpaidCount'] > 0){
                    $conn->rollBack();
                    return json_encode("Cannot renew: this item has an unpaid fine");
                }

                //kwaon ang due date, role, ug category
                $sqlInfo = "SELECT bi.expires_at, r.role_type, c.category_type
                            FROM borrow_items bi
                            INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                            INNER JOIN users u ON bt.borrower_id = u.user_id
                            INNER JOIN roles r ON u.role_id = r.role_id
                            INNER JOIN book_copies bc ON bi.copy_id = bc.copy_id
                            INNER JOIN books b ON bc.book_id = b.book_id
                            INNER JOIN categories c ON b.category_id = c.category_id
                            WHERE bi.borrow_item_id=:borrow_item_id AND bi.is_returned=0";
                $stmtInfo = $conn->prepare($sqlInfo);
                $stmtInfo->bindParam(":borrow_item_id", $borrowItemId);
                $stmtInfo->execute();
                $itemInfo = $stmtInfo->fetch(PDO::FETCH_ASSOC);

                if(!$itemInfo){
                    $conn->rollBack();
                    return json_encode("Item not found or already returned");
                }

                $oldDueDate = $itemInfo['expires_at'];

                //extend ang duration based sa category ug role, basically pareha ra sa borrow
                if($itemInfo['role_type'] == "Faculty"){
                    $sqlUpdate = "UPDATE borrow_items SET expires_at=DATE_ADD(expires_at, INTERVAL 3 MONTH)
                                WHERE borrow_item_id=:borrow_item_id";
                }
                elseif($itemInfo['category_type'] == "Educational"){
                    $sqlUpdate = "UPDATE borrow_items SET expires_at=DATE_ADD(expires_at, INTERVAL 3 DAY)
                                WHERE borrow_item_id=:borrow_item_id";
                }
                else{
                    $sqlUpdate = "UPDATE borrow_items SET expires_at=DATE_ADD(expires_at, INTERVAL 7 DAY)
                                WHERE borrow_item_id=:borrow_item_id";
                }
                $stmtUpdate = $conn->prepare($sqlUpdate);
                $stmtUpdate->bindParam(":borrow_item_id", $borrowItemId);
                $stmtUpdate->execute();

                //kwaon utro ang bag o nga due date para sa records
                $stmtInfo->execute();
                $updatedItem = $stmtInfo->fetch(PDO::FETCH_ASSOC);
                //once again ternary shorthand para iset ang new due date according sa kung unsay nakuha sa previous query
                //if($updatedItem){
                //  $newDueDate = $updatedItem['expires_at'];
                //}
                //else{
                //  $newDueDate = null;
                //}
                $newDueDate = $updatedItem ? $updatedItem['expires_at'] : null;

                $sqlLog = "INSERT INTO renewal_records(borrow_item_id, old_due_date, new_due_date, renewed_at, renewed_by)
                            VALUES(:borrow_item_id, :old_due_date, :new_due_date, NOW(), :renewed_by)";
                $stmtLog = $conn->prepare($sqlLog);
                $stmtLog->bindParam(":borrow_item_id", $borrowItemId);
                $stmtLog->bindParam(":old_due_date", $oldDueDate);
                $stmtLog->bindParam(":new_due_date", $newDueDate);
                $stmtLog->bindParam(":renewed_by", $renewedBy);
                $stmtLog->execute();

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

    $renewalrecord = new RenewalRecord();
    switch($operation){
        case "getAllRenewals":
            echo $renewalrecord->getAllRenewals();
            break;
        case "addRenewal":
            echo $renewalrecord->addRenewal($json);
            break;
    }
?>