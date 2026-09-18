<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Status{
        function getAllStatuses(){
            include "connection.php";

            $sql = "SELECT * FROM statuses";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addStatus($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO statuses(status_desc) VALUES(:status_desc)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":status_desc", $json['status_desc']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getStatus($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM statuses
            WHERE status_id=:status_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":status_id", $json['status_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateStatus($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE statuses SET status_desc=:status_desc 
            WHERE status_id=:status_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":status_id", $json['status_id']);
            $stmt->bindParam(":status_desc", $json['status_desc']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteStatus($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM statuss
            WHERE status_id=:status_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":status_id", $json['status_id']);
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

    $status = new status();
    switch($operation){
        case "getAllStatuses":
            echo $status->getAllStatuses();
            break;
        case "addStatus":
            echo $status->addStatus($json);
            break;
        case "getStatus":
            echo $status->getStatus($json);
            break;
        case "updateStatus":
            echo $status->updateStatus($json);
            break;
        case "deleteStatus":
            echo $status->deleteStatus($json);
            break;
    }
?>