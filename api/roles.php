<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    class Role{
        function getAllRoles($json){
            include "connection.php";

            $json = json_decode($json, true) ?: [];

            $activeOnly = !empty($json['active_only']);
            $where = $activeOnly ? "WHERE is_active = 1" : "";

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            $sqlCount = "SELECT COUNT(*) FROM roles $where";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT role_id, role_type, is_active FROM roles
                $where
                ORDER BY role_type
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
        function addRole($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO roles(role_type) VALUES(:role_type)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":role_type", $json['role_type']);
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

            $sql = "SELECT role_id, role_type, is_active FROM roles
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

            $sql = "UPDATE roles SET role_type=:role_type 
            WHERE role_id=:role_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":role_id", $json['role_id']);
            $stmt->bindParam(":role_type", $json['role_type']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deactivateRole($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM roles WHERE role_id = :role_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":role_id", $json['role_id']);
            $checkStmt->execute();
            $role = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$role){
                return "Invalid Role";
            }
            if($role['is_active'] == 0){
                return "Role is already inactive";
            }

            $sql = "UPDATE roles SET is_active=0 WHERE role_id=:role_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":role_id", $json['role_id']);
            $stmt->execute();

            $returnValue = 0;
            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }

            return json_encode($returnValue);
        }
        function reactivateRole($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM roles WHERE role_id = :role_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":role_id", $json['role_id']);
            $checkStmt->execute();
            $role = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$role){
                return "Invalid Role";
            }
            if($role['is_active'] == 1){
                return "Role is already active";
            }

            $sql = "UPDATE roles SET is_active=1 WHERE role_id=:role_id";
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
            echo $role->getAllRoles($json);
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
        case "deactivateRole":
            echo $role->deactivateRole($json);
            break;
        case "reactivateRole":
            echo $role->reactivateRole($json);
            break;
    }
?>