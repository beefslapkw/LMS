<?php
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    class Category{
        function getAllCategories($json){
            include "connection.php";

            $json = json_decode($json, true);

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            //total count para sa ibuild nga pages sa frontend
            $sqlCount = "SELECT COUNT(*) FROM categories";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT * FROM categories
                ORDER BY category_type
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
        function addCategory($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO categories(category_type, borrow_duration) VALUES(:category_type, :borrow_duration)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":category_type", $json['category_type']);
            $stmt->bindParam(":borrow_duration", $json['borrow_duration']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getCategory($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM categories
            WHERE category_id=:category_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":category_id", $json['category_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateCategory($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE categories SET category_type=:category_type, borrow_duration=:borrow_duration 
            WHERE category_id=:category_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":category_id", $json['category_id']);
            $stmt->bindParam(":category_type", $json['category_type']);
            $stmt->bindParam(":borrow_duration", $json['borrow_duration']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteCategory($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM categories
            WHERE category_id=:category_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":category_id", $json['category_id']);
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

    $category = new Category();
    switch($operation){
        case "getAllCategories":
            echo $category->getAllCategories($json);
            break;
        case "addCategory":
            echo $category->addCategory($json);
            break;
        case "getCategory":
            echo $category->getCategory($json);
            break;
        case "updateCategory":
            echo $category->updateCategory($json);
            break;
        case "deleteCategory":
            echo $category->deleteCategory($json);
            break;
    }
?>