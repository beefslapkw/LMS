<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Book{
        function getAllBooks(){
            include "connection.php";

            $sql = "SELECT b.*,
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
        function addBook($json){
            include "connection.php";

            $json = json_decode($json, true);

            $book = $json['book'];
            $authors = $json['authors'];

            try{
                $conn->beginTransaction();

                $sql = "INSERT INTO books(category_id, genre_id, book_title, publisher_id, shelf_location, added_by, added_at)
                        VALUES(:category_id, :genre_id, :book_title, :publisher_id, :shelf_location, :added_by, NOW())";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":category_id", $book['category_id']);
                $stmt->bindParam(":genre_id", $book['genre_id']);
                $stmt->bindParam(":book_title", $book['book_title']);
                $stmt->bindParam(":publisher_id", $book['publisher_id']);
                $stmt->bindParam(":shelf_location", $book['shelf_location']);
                $stmt->bindParam(":added_by", $book['added_by']);
                $stmt->execute();
                $newId = $conn->lastInsertId();

                $sqlAuthor = "INSERT INTO book_authors(book_id, author_id) VALUES(:book_id, :author_id)";
                $stmtAuthor = $conn->prepare($sqlAuthor);
                foreach($authors as $authorId){
                    $stmtAuthor->bindParam(":book_id", $newId);
                    $stmtAuthor->bindParam(":author_id", $authorId);
                    $stmtAuthor->execute();
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
        function getBook($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT b.*,
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
                    WHERE b.book_id=:book_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":book_id", $json['book_id']);
            $stmt->execute();

            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

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
        case "addBook":
            echo $book->addBook($json);
            break;
        case "getBook":
            echo $book->getBook($json);
            break;
    }
?>