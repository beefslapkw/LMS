<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    class Publisher{
        function getAllPublishers($json){
            include "connection.php";

            $json = json_decode($json, true) ?: [];

            $activeOnly = !empty($json['active_only']);
            $where = $activeOnly ? "WHERE is_active = 1" : "";

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            $sqlCount = "SELECT COUNT(*) FROM publishers $where";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT publisher_id, publisher_name, is_active FROM publishers
                $where
                ORDER BY publisher_name
                LIMIT :limit OFFSET :offset";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode([
                "data" => $rs,
                "total" => $totalRows,
                "page" => $page,
                "limit" => $limit,
                "totalPages" => (int)ceil($totalRows / $limit)
            ]);
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

            $sql = "SELECT publisher_id, publisher_name, is_active FROM publishers
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
        function deactivatePublisher($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM publishers WHERE publisher_id = :publisher_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":publisher_id", $json['publisher_id']);
            $checkStmt->execute();
            $publisher = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$publisher){
                return "Invalid Publisher";
            }
            if($publisher['is_active'] == 0){
                return "Publisher is already inactive";
            }

            $sql = "UPDATE publishers SET is_active=0 WHERE publisher_id=:publisher_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":publisher_id", $json['publisher_id']);
            $stmt->execute();

            $returnValue = 0;
            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }

            return json_encode($returnValue);
        }
        function reactivatePublisher($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM publishers WHERE publisher_id = :publisher_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":publisher_id", $json['publisher_id']);
            $checkStmt->execute();
            $publisher = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$publisher){
                return "Invalid Publisher";
            }
            if($publisher['is_active'] == 1){
                return "Publisher is already active";
            }

            $sql = "UPDATE publishers SET is_active=1 WHERE publisher_id=:publisher_id";
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
            echo $publisher->getAllPublishers($json);
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
        case "deactivatePublisher":
            echo $publisher->deactivatePublisher($json);
            break;
        case "reactivatePublisher":
            echo $publisher->reactivatePublisher($json);
            break;
    }
?>