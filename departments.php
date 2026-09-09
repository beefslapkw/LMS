<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Department{
        function getAllDepartments(){
            include "connection.php";

            $sql = "SELECT * FROM users WHERE username=:username";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":username", $json['username']);
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

    $department = new Department();
    switch($operation){
        case "login":
            echo $department->getAllDepartments();
            break;
    }
?>