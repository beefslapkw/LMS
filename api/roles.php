<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Role{
        function getAllRoles(){
            include "connection.php";

            $sql = "SELECT * FROM roles";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function addRole($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO roles(role_name) VALUES(:role_name)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":role_name", $json['role_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getRole($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM roles
            WHERE role_id=:role_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":role_id", $json['role_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateRole($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE roles SET role_name=:role_name 
            WHERE role_id=:role_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":role_id", $json['role_id']);
            $stmt->bindParam(":role_name", $json['role_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteRole($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM roles
            WHERE role_id=:role_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":role_id", $json['role_id']);
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

    $role = new Role();
    switch($operation){
        case "getAllRoles":
            echo $role->getAllRoles();
            break;
        case "addRole":
            echo $role->addRole($json);
            break;
        case "getRole":
            echo $role->getRole($json);
            break;
        case "updateRole":
            echo $role->updateRole($json);
            break;
        case "deleteRole":
            echo $role->deleteRole($json);
            break;
    }
?>