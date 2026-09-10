<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    function checkRoleId($idnum){
        if(str_starts_with($idnum, 'H')){
            return 1;
        }
        if(str_starts_with($idnum, 'F')){
            return 4;
        }
        return 3;
    }

    class User{
        function getAllUsers(){
            include "connection.php";

            $sql = "SELECT u.user_id, u.id_number, u.last_name, u.first_name, u.contact_number, u.email_address, u.username,
                        r.role_type, d.department_name, u.is_active
                    FROM users u
                    INNER JOIN roles r ON u.role_id=r.role_id
                    LEFT JOIN departments d ON u.department_id=d.department_id";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function getUser($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT u.user_id, u.id_number, u.last_name, u.first_name, u.contact_number, u.email_address, u.username,
                        r.role_type, d.department_name, u.is_active
                    FROM users u
                    INNER JOIN roles r ON u.role_id=r.role_id
                    LEFT JOIN departments d ON u.department_id=d.department_id
                    WHERE u.user_id=:user_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":user_id", $json['user_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function login($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM users WHERE username=:username";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":username", $json['username']);
            $stmt->execute();
            $userdata = $stmt->fetch(PDO::FETCH_ASSOC);

            if($userdata && $json['username'] == $userdata['username'] && password_verify($json['password'] ,$userdata['password'])){
                return json_encode($userdata);
            }
            else{
                return "Incorrect username or password";
            }
        }
        function register($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM users WHERE username=:username";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":username", $json['username']);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if($user){
                return "Username already exists";
            }

            $password = password_hash($json['password'], PASSWORD_DEFAULT);
            $roleId = checkRoleId($json['id_number']);

            $sql2 = "INSERT INTO users(role_id, id_number, last_name, first_name, contact_number, email_address,
                        username, password, department_id) 
                    VALUES(:role_id, :id_number, :last_name, :first_name, :contact_number, :email_address,
                        :username, :password, :department_id)";
            $stmt2 = $conn->prepare($sql2);
            $stmt2->bindParam(":role_id", $roleId);
            $stmt2->bindParam(":id_number", $json['id_number']);
            $stmt2->bindParam(":last_name", $json['last_name']);
            $stmt2->bindParam(":first_name", $json['first_name']);
            $stmt2->bindParam(":contact_number", $json['contact_number']);
            $stmt2->bindParam(":email_address", $json['email_address']);
            $stmt2->bindParam(":username", $json['username']);
            $stmt2->bindParam(":password", $password);
            $stmt2->bindParam(":department_id", $json['department_id']);
            $stmt2->execute();
            
            $returnValue = 0;
            if($stmt2->rowCount() > 0){
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

    $user = new User();
    switch($operation){
        case "getAllUsers":
            echo $user->getAllUsers();
            break;
        case "getUser":
            echo $user->getUser($json);
            break;
        case "login":
            echo $user->login($json);
            break;
        case "register":
            echo $user->register($json);
            break;
    }
?>