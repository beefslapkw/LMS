<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    class TransactionHistory{
        function getAllTransactionHistory($json){
            include "connection.php";

            $json = json_decode($json ?? '{}', true) ?: [];

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;

            $history = "SELECT 'Borrow' AS transaction_type, bt.transaction_id, bt.borrowed_at AS transaction_date,
                            borrower.first_name AS borrower_first_name, borrower.last_name AS borrower_last_name,
                            staff.first_name AS staff_first_name, staff.last_name AS staff_last_name
                        FROM borrow_transactions bt
                        INNER JOIN users borrower ON bt.borrower_id=borrower.user_id
                        INNER JOIN users staff ON bt.processed_by=staff.user_id

                        UNION ALL

                        SELECT DISTINCT 'Return', rt.return_transaction_id, rt.returned_at,
                            borrower.first_name, borrower.last_name,
                            staff.first_name, staff.last_name
                        FROM return_transactions rt
                        INNER JOIN return_items ri ON rt.return_transaction_id=ri.return_transaction_id
                        INNER JOIN borrow_items bi ON ri.borrow_item_id=bi.borrow_item_id
                        INNER JOIN borrow_transactions bt ON bi.transaction_id=bt.transaction_id
                        INNER JOIN users borrower ON bt.borrower_id=borrower.user_id
                        INNER JOIN users staff ON rt.received_by=staff.user_id

                        UNION ALL

                        SELECT 'Renewal', rr.renewal_record_id, rr.renewed_at,
                            borrower.first_name, borrower.last_name,
                            staff.first_name, staff.last_name
                        FROM renewal_records rr
                        INNER JOIN borrow_items bi ON rr.borrow_item_id=bi.borrow_item_id
                        INNER JOIN borrow_transactions bt ON bi.transaction_id=bt.transaction_id
                        INNER JOIN users borrower ON bt.borrower_id=borrower.user_id
                        INNER JOIN users staff ON rr.renewed_by=staff.user_id";

            $sqlCount = "SELECT COUNT(*) FROM ($history) AS history";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $totalPages = max(1, (int)ceil($totalRows / $limit));
            $page = min($page, $totalPages);
            $offset = ($page - 1) * $limit;

            $sql = "SELECT * FROM ($history) AS history
                    ORDER BY transaction_date DESC, transaction_id DESC
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
                "totalPages" => $totalPages
            ]);
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

    $transactionhistory = new TransactionHistory();
    switch($operation){
        case "getAllTransactionHistory":
            echo $transactionhistory->getAllTransactionHistory($json);
            break;
    }
?>