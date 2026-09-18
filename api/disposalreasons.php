<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class DisposalReason{
        function getAllDisposalReasons(){
            include "connection.php";

            $sql = "SELECT * FROM disposal_reasons";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addDisposalReason($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO disposal_reasons(reason_desc) VALUES(:reason_desc)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":reason_desc", $json['reason_desc']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getDisposalReason($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM disposal_reasons
            WHERE reason_id=:reason_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":reason_id", $json['reason_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateDisposalReason($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE disposal_reasons SET reason_desc=:reason_desc 
            WHERE reason_id=:reason_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":reason_id", $json['reason_id']);
            $stmt->bindParam(":reason_desc", $json['reason_desc']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteDisposalReason($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM disposal_reasons
            WHERE reason_id=:reason_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":reason_id", $json['reason_id']);
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

    $disposalReason = new DisposalReason();
    switch($operation){
        case "getAllDisposalReasons":
            echo $disposalReason->getAllDisposalReasons();
            break;
        case "addDisposalReason":
            echo $disposalReason->addDisposalReason($json);
            break;
        case "getDisposalReason":
            echo $disposalReason->getDisposalReason($json);
            break;
        case "updateDisposalReason":
            echo $disposalReason->updateDisposalReason($json);
            break;
        case "deleteDisposalReason":
            echo $disposalReason->deleteDisposalReason($json);
            break;
    }
?>