<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Author{
        function getAllAuthors(){
            include "connection.php";

            $sql = "SELECT * FROM authors";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO authors(author_name) VALUES(:author_name)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_name", $json['author_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM authors
            WHERE author_id=:author_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_id", $json['author_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE authors SET author_name=:author_name 
            WHERE author_id=:author_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_id", $json['author_id']);
            $stmt->bindParam(":author_name", $json['author_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM authors
            WHERE author_id=:author_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_id", $json['author_id']);
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

    $author = new Author();
    switch($operation){
        case "getAllAuthors":
            echo $author->getAllAuthors();
            break;
        case "addAuthor":
            echo $author->addAuthor($json);
            break;
        case "getAuthor":
            echo $author->getAuthor($json);
            break;
        case "updateAuthor":
            echo $author->updateAuthor($json);
            break;
        case "deleteAuthor":
            echo $author->deleteAuthor($json);
            break;
    }
?>