<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Publisher{
        function getAllPublishers(){
            include "connection.php";

            $sql = "SELECT * FROM publishers";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addPublisher($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO publishers(publisher_name) VALUES(:publisher_name)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":publisher_name", $json['publisher_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getPublisher($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM publishers
            WHERE publisher_id=:publisher_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":publisher_id", $json['publisher_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updatePublisher($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE publishers SET publisher_name=:publisher_name 
            WHERE publisher_id=:publisher_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":publisher_id", $json['publisher_id']);
            $stmt->bindParam(":publisher_name", $json['publisher_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deletePublisher($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM publishers
            WHERE publisher_id=:publisher_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":publisher_id", $json['publisher_id']);
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

    $publisher = new Publisher();
    switch($operation){
        case "getAllPublishers":
            echo $publisher->getAllPublishers();
            break;
        case "addPublisher":
            echo $publisher->addPublisher($json);
            break;
        case "getPublisher":
            echo $publisher->getPublisher($json);
            break;
        case "updatePublisher":
            echo $publisher->updatePublisher($json);
            break;
        case "deletePublisher":
            echo $publisher->deletePublisher($json);
            break;
    }
?>