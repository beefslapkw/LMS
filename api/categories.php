<?php
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Category{
        function getAllCategories(){
            include "connection.php";

            $sql = "SELECT * FROM categories";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
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
            echo $category->getAllCategories();
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