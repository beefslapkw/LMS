<?php
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Genre{
        function getAllGenres(){
            include "connection.php";

            $sql = "SELECT * FROM genres";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addGenre($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO genres(genre_name) VALUES(:genre_name)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":genre_name", $json['genre_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getGenre($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM genres
            WHERE genre_id=:genre_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":genre_id", $json['genre_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateGenre($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE genres SET genre_name=:genre_name 
            WHERE genre_id=:genre_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":genre_id", $json['genre_id']);
            $stmt->bindParam("genre_name", $json['genre_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteGenre($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM genres
            WHERE genre_id=:genre_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":genre_id", $json['genre_id']);
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

    $genre = new Genre();
    switch($operation){
        case "getAllGenres":
            echo $genre->getAllGenres();
            break;  
        case "addGenre":
            echo $genre->addGenre($json);
            break;
        case "getGenre":
            echo $genre->getGenre($json);
            break;
        case "updateGenre":
            echo $genre->updateGenre($json);
            break; 
        case "deleteGenre":
            echo $genre->deleteGenre($json);
            break;
    }
?>