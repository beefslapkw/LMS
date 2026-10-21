<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    class Department{
        function getAllDepartments($json){
            include "connection.php";

            $json = json_decode($json, true) ?: [];

            $activeOnly = !empty($json['active_only']);
            $where = $activeOnly ? "WHERE is_active = 1" : "";

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            $sqlCount = "SELECT COUNT(*) FROM departments $where";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT department_id, department_name, is_active FROM departments
                $where
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

            $sql = "SELECT department_id, department_name, is_active FROM departments
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
        function deactivateDepartment($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM departments WHERE department_id = :department_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":department_id", $json['department_id']);
            $checkStmt->execute();
            $department = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$department){
                return "Invalid Department";
            }
            if($department['is_active'] == 0){
                return "Department is already inactive";
            }

            $sql = "UPDATE departments SET is_active=0 WHERE department_id=:department_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":department_id", $json['department_id']);
            $stmt->execute();

            $returnValue = 0;
            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }

            return json_encode($returnValue);
        }
        function reactivateDepartment($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM departments WHERE department_id = :department_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":department_id", $json['department_id']);
            $checkStmt->execute();
            $department = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$department){
                return "Invalid Department";
            }
            if($department['is_active'] == 1){
                return "Department is already active";
            }

            $sql = "UPDATE departments SET is_active=1 WHERE department_id=:department_id";
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
        case "deactivateDepartment":
            echo $department->deactivateDepartment($json);
            break;
        case "reactivateDepartment":
            echo $department->reactivateDepartment($json);
            break;
    }
?>