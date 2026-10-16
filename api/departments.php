<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Department{
        function getAllDepartments($json){
            include "connection.php";

            $json = json_decode($json, true);

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            //total count para sa ibuild nga pages sa frontend
            $sqlCount = "SELECT COUNT(*) FROM departments";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT * FROM departments
                ORDER BY department_name
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
        function addDepartment($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO departments(department_name) VALUES(:department_name)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":department_name", $json['department_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getDepartment($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM departments
            WHERE department_id=:department_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":department_id", $json['department_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateDepartment($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE departments SET department_name=:department_name 
            WHERE department_id=:department_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":department_id", $json['department_id']);
            $stmt->bindParam(":department_name", $json['department_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deleteDepartment($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "DELETE FROM departments
            WHERE department_id=:department_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":department_id", $json['department_id']);
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

    $department = new Department();
    switch($operation){
        case "getAllDepartments":
            echo $department->getAllDepartments($json);
            break;
        case "addDepartment":
            echo $department->addDepartment($json);
            break;
        case "getDepartment":
            echo $department->getDepartment($json);
            break;
        case "updateDepartment":
            echo $department->updateDepartment($json);
            break;
        case "deleteDepartment":
            echo $department->deleteDepartment($json);
            break;
    }
?>