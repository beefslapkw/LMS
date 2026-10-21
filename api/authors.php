<?php 
    header('Content-Type: application/json');

    require_once "auth.php";
    enforceAccess();

    class Author{
        function getAllAuthors($json){
            include "connection.php";

            $json = json_decode($json, true) ?: [];

            $activeOnly = !empty($json['active_only']);
            $where = $activeOnly ? "WHERE is_active = 1" : "";

            $page  = isset($json['page']) ? max(1, (int)$json['page']) : 1;
            $limit = isset($json['limit']) ? min(100, max(1, (int)$json['limit'])) : 10;
            $offset = ($page - 1) * $limit;

            $sqlCount = "SELECT COUNT(*) FROM authors $where";
            $stmtCount = $conn->prepare($sqlCount);
            $stmtCount->execute();
            $totalRows = (int)$stmtCount->fetchColumn();

            $sql = "SELECT author_id, author_name, is_active FROM authors
                $where
                ORDER BY author_name
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
        function addAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "INSERT INTO authors(author_name) VALUES(:author_name)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_name", $json['author_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function getAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT author_id, author_name, is_active FROM authors
            WHERE author_id=:author_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_id", $json['author_id']);
            $stmt->execute();
            $rs = $stmt->fetch(PDO::FETCH_ASSOC);

            return json_encode($rs);
        }
        function updateAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "UPDATE authors SET author_name=:author_name 
            WHERE author_id=:author_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_id", $json['author_id']);
            $stmt->bindParam(":author_name", $json['author_name']);
            $stmt->execute();
            $returnValue = 0;

            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }
            return json_encode($returnValue);
        }
        function deactivateAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM authors WHERE author_id = :author_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":author_id", $json['author_id']);
            $checkStmt->execute();
            $author = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$author){
                return "Invalid Author";
            }
            if($author['is_active'] == 0){
                return "Author is already inactive";
            }

            $sql = "UPDATE authors SET is_active=0 WHERE author_id=:author_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_id", $json['author_id']);
            $stmt->execute();

            $returnValue = 0;
            if($stmt->rowCount() > 0){
                $returnValue = 1;
            }

            return json_encode($returnValue);
        }
        function reactivateAuthor($json){
            include "connection.php";

            $json = json_decode($json, true);

            $checkSql = "SELECT is_active FROM authors WHERE author_id = :author_id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(":author_id", $json['author_id']);
            $checkStmt->execute();
            $author = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if(!$author){
                return "Invalid Author";
            }
            if($author['is_active'] == 1){
                return "Author is already active";
            }

            $sql = "UPDATE authors SET is_active=1 WHERE author_id=:author_id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":author_id", $json['author_id']);
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

    $author = new Author();
    switch($operation){
        case "getAllAuthors":
            echo $author->getAllAuthors($json);
            break;
        case "addAuthor":
            echo $author->addAuthor($json);
            break;
        case "getAuthor":
            echo $author->getAuthor($json);
            break;
        case "updateAuthor":
            echo $author->updateAuthor($json);
            break;
        case "deactivateAuthor":
            echo $author->deactivateAuthor($json);
            break;
        case "reactivateAuthor":
            echo $author->reactivateAuthor($json);
            break;
    }
?>