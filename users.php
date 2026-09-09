<?php 
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class User{
        function login($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT * FROM users WHERE username=:username";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":username", $json['username']);
            $stmt->execute();
            $userdata = $stmt->fetch(PDO::FETCH_ASSOC);

            $password = password_hash($json['password'], PASSWORD_DEFAULT);

            if($userdata && $json['username'] == $userdata['username'] && $password == $userdata['password']){
                return "Successfully Logged In";
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

            $sql2 = "INSERT INTO users(username, password) VALUES(:username, :password)";
            $stmt2 = $conn->prepare($sql2);
            $stmt2->bindParam(":username", $json['username']);
            $stmt2->bindParam(":password", $json['password']);
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
        case "login":
            echo $user->login($json);
            break;
        case "register":
            echo $user->register($json);
            break;
    }
?>