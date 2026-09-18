<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Condition{
        function getAllConditions(){
            include "connection.php";

            $sql = "SELECT * FROM conditions";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addCondition($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO conditions(condition_desc) VALUES(:condition_desc)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":condition_desc", $json['condition_desc']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getCondition($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM conditions
            WHERE condition_id=:condition_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":condition_id", $json['condition_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateCondition($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE conditions SET condition_desc=:condition_desc 
            WHERE condition_id=:condition_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":condition_id", $json['condition_id']);
            $stmt->bindParam(":condition_desc", $json['condition_desc']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteCondition($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM conditions
            WHERE condition_id=:condition_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":condition_id", $json['condition_id']);
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

    $condition = new Condition();
    switch($operation){
        case "getAllConditions":
            echo $condition->getAllConditions();
            break;
        case "addCondition":
            echo $condition->addCondition($json);
            break;
        case "getCondition":
            echo $condition->getCondition($json);
            break;
        case "updateCondition":
            echo $condition->updateCondition($json);
            break;
        case "deleteCondition":
            echo $condition->deleteCondition($json);
            break;
    }
?>