<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Department{
        function getAllDepartments(){
            include "connection.php";

            $sql = "SELECT * FROM departments";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
        case "getAllDepartments":
            echo $department->getAllDepartments();
            break;
    }
?>