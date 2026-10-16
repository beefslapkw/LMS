<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Student{
        function getBorrowedBooks($json){
            include "connection.php";

            $json = json_decode($json, true);

            $user_id = (int)$json['user_id'];
            $status = isset($json['status']) ? $json['status'] : 'all';

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            $joins = "FROM borrow_items bi
                INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                INNER JOIN book_copies bc ON bi.copy_id = bc.copy_id
                INNER JOIN books b ON bc.book_id = b.book_id
                INNER JOIN users u ON bt.processed_by = u.user_id
                LEFT JOIN return_items ri ON ri.borrow_item_id = bi.borrow_item_id
                LEFT JOIN return_transactions rt ON ri.return_transaction_id = rt.return_transaction_id";

            $where = "WHERE bt.borrower_id = :user_id";
            switch($status){
                case 'active':
                    $where .= " AND bi.is_returned = 0 AND bi.expires_at >= NOW()";
                    break;
                case 'overdue':
                    $where .= " AND bi.is_returned = 0 AND bi.expires_at < NOW()";
                    break;
                case 'returned':
                    $where .= " AND bi.is_returned = 1";
                    break;
            }

            //total count para sa ibuild nga pages sa frontend
            $sqlCount = "SELECT COUNT(*) $joins $where";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->bindValue(":user_id", $user_id, PDO::PARAM_INT);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT bi.borrow_item_id, bc.accession_number, b.book_title,
                        bt.borrowed_at, bi.expires_at, rt.returned_at,
                        u.first_name AS processed_by_first_name,
                        u.last_name AS processed_by_last_name,
                        CASE
                            WHEN bi.is_returned = 1 THEN 'returned'
                            WHEN bi.expires_at < NOW() THEN 'overdue'
                            ELSE 'active'
                        END AS status
                    $joins $where
                    ORDER BY bt.borrowed_at DESC
                    LIMIT :limit OFFSET :offset";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
            $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
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
        function getFines($json){
            include "connection.php";

            $json = json_decode($json, true);

            $user_id = (int)$json['user_id'];
            $status = isset($json['status']) ? $json['status'] : 'unpaid';
            $is_paid = $status == 'paid' ? 1 : 0;
            $orderBy = $is_paid == 1 ? "f.paid_at DESC" : "f.fine_id DESC";

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            $joins = "FROM fine_records f
                INNER JOIN borrow_items bi ON f.borrow_item_id = bi.borrow_item_id
                INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                INNER JOIN book_copies bc ON bi.copy_id = bc.copy_id
                INNER JOIN books b ON bc.book_id = b.book_id";

            $where = "WHERE bt.borrower_id = :user_id AND f.is_paid = :is_paid";

            //total count para sa ibuild nga pages sa frontend
            $sqlCount = "SELECT COUNT(*) $joins $where";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->bindValue(":user_id", $user_id, PDO::PARAM_INT);
            $stmtCount->bindValue(":is_paid", $is_paid, PDO::PARAM_INT);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT f.fine_id, bc.accession_number, b.book_title,
                        f.days_late, f.fine_amount, f.paid_at
                    $joins $where
                    ORDER BY $orderBy
                    LIMIT :limit OFFSET :offset";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(":user_id", $user_id, PDO::PARAM_INT);
            $stmt->bindValue(":is_paid", $is_paid, PDO::PARAM_INT);
            $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
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

        function getFineBalance($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT COALESCE(SUM(f.fine_amount), 0) AS balance, COUNT(*) AS fine_count
                    FROM fine_records f
                    INNER JOIN borrow_items bi ON f.borrow_item_id = bi.borrow_item_id
                    INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                    WHERE bt.borrower_id = :user_id AND f.is_paid = 0";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(":user_id", (int)$json['user_id'], PDO::PARAM_INT);
            $stmt->execute();

            return json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        }
        function getBorrowedCount($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT COUNT(*)
                    FROM borrow_items bi
                    INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                    WHERE bt.borrower_id = :user_id AND bi.is_returned = 0";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(":user_id", (int)$json['user_id'], PDO::PARAM_INT);
            $stmt->execute();

            return json_encode((int)$stmt->fetchColumn());
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

    $student = new Student();
    switch($operation){
        case "getBorrowedBooks":
            echo $student->getBorrowedBooks($json);
            break;
        case "getFines":
            echo $student->getFines($json);
            break;
        case "getFineBalance":
            echo $student->getFineBalance($json);
            break;
        case "getBorrowedCount":
            echo $student->getBorrowedCount($json);
            break;
    }
?>