<?php 
    $servername = "localhost";
    $dbusername = "root";      //ilisi ug dedicated user, tan-awa ang SETUP.md (section 6)
    $dbpassword = "";
    $dbname = "librarydb";

    try{
        $conn = new PDO("mysql:host=$servername;dbname=$dbname", $dbusername, $dbpassword);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch(PDOException $e){
        error_log("DB connection failed: " . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode("Server error");
        exit;
    }
?>