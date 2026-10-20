<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    require_once "reservationhelpers.php";
    enforceAccess();

    class CheckOverdue{
        function getMyOverdues($json){
            include "connection.php";

            $json = json_decode($json, true);

            $userId = currentUserId();
            $thresholdDays = 3; 

            $sql = "SELECT 
                        bi.borrow_item_id,
                        bi.expires_at,
                        DATEDIFF(NOW(), bi.expires_at) AS days_overdue,
                        bc.accession_number,
                        b.book_title,
                        bt.borrower_id
                    FROM borrow_items bi
                    INNER JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
                    INNER JOIN book_copies bc ON bi.copy_id = bc.copy_id
                    INNER JOIN books b ON bc.book_id = b.book_id
                    WHERE bi.is_returned = 0 
                    AND bt.borrower_id = :user_id
                    AND bi.expires_at < NOW()
                    AND DATEDIFF(NOW(), bi.expires_at) >= :threshold";

            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':threshold', $thresholdDays, PDO::PARAM_INT);
            $stmt->execute();
            $overdueItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($overdueItems)) {
                //list tanan overdue book titles
                $booksList = array_map(function($item) {
                    return [
                        'book_title'       => $item['book_title'],
                        'accession_number' => $item['accession_number'],
                        'days_overdue'     => (int)$item['days_overdue'],
                        'due_date'         => date('M d, Y', strtotime($item['expires_at']))
                    ];
                }, $overdueItems);

                pushWebSocketNotification('/api/notify-overdue', [
                    'borrower_id' => (int)$userId,
                    'count'       => count($overdueItems),
                    'books'       => $booksList
                ]);
            }

            return json_encode([
                "status" => "success",
                "notified_count" => count($overdueItems)
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

    $checkoverdue = new CheckOverdue();
    switch($operation){
        case "getMyOverdues":
            echo $checkoverdue->getMyOverdues($json);
            break;
    }
?>