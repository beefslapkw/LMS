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
    }
?>