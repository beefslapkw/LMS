<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Book{
        function getAllBooks(){
            include "connection.php";

            $sql = "SELECT b.book_id, b.book_title, b.shelf_location, b.added_at, b.is_active,
                        c.category_type, g.genre_name, p.publisher_name,
                            u.first_name, u.last_name,
                        GROUP_CONCAT(a.author_name SEPARATOR ', ') AS authors
                    FROM books b
                    INNER JOIN categories c ON b.category_id = c.category_id
                    INNER JOIN genres g ON b.genre_id = g.genre_id
                    INNER JOIN publishers p ON b.publisher_id = p.publisher_id
                    INNER JOIN users u ON b.added_by = u.user_id
                    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
                    LEFT JOIN authors a ON ba.author_id = a.author_id
                    GROUP BY b.book_id
                    ORDER BY b.shelf_location";
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

    $book = new Book();
    switch($operation){
        case "getAllBooks":
            echo $book->getAllBooks();
            break;
    }
?>