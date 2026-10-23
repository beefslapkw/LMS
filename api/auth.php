<?php
    header_remove('Access-Control-Allow-Origin');

    const HEAD      = [1];            //Head Librarian
    const STAFF     = [1, 2];         //Head Librarian + Student Assistant
    const BORROWERS = [3, 4];         //Student + Faculty
    const ALL_ROLES = [1, 2, 3, 4];

    const SESSION_IDLE_SECONDS = 7200;   //2 hours

    const APP_PATH = '/LMS';
    const ROLE_HOME = [
        1 => APP_PATH . '/templates/headLibrarian.html',
        2 => APP_PATH . '/templates/studentAssistant.html',
        3 => APP_PATH . '/templates/student.html',
        4 => APP_PATH . '/templates/faculty.html',
    ];

    const ACCESS = [
        'users.php'        => ['default' => HEAD, 'ops' => [
                                'login' => null, 'logout' => ALL_ROLES, 'me' => ALL_ROLES,
                                'addUser' => null,   //public registration; addUser() limits non-Head callers to student/faculty
                                'getUserByIdNumber' => STAFF]],

        'books.php'        => ['read' => ALL_ROLES, 'write' => STAFF],
        'bookcopies.php'   => ['default' => STAFF, 'ops' => [
                                'getAvailableCountsByBook' => ALL_ROLES,
                                'getAvailableCount'        => ALL_ROLES,
                                'searchCopies'             => ALL_ROLES,
                                'disposeCopy'              => HEAD]],
        'authors.php'      => ['default' => STAFF],
        'publishers.php'   => ['default' => STAFF],

        'genres.php'       => ['read' => STAFF, 'write' => HEAD],
        'categories.php'   => ['read' => STAFF, 'write' => HEAD],
        'conditions.php'   => ['read' => STAFF, 'write' => HEAD],

        'departments.php'     => ['read' => ALL_ROLES, 'write' => HEAD, 'ops' => [
                                    'getAllDepartments' => null]],  //public/all: register page dropdown
        'disposalreasons.php' => ['read' => STAFF, 'write' => HEAD],
        'roles.php'           => ['default' => HEAD],
        'statuses.php'        => ['default' => HEAD],

        'borrowtransactions.php' => ['default' => STAFF],
        'returntransactions.php' => ['default' => STAFF],
        'renewals.php'           => ['default' => STAFF],
        'fines.php'              => ['default' => STAFF],
        'transactionhistory.php' => ['default' => STAFF],

        'student.php'      => ['default' => ALL_ROLES],   //own-data only, see resolveUserId()
        'reservationtransactions.php' => ['default' => ALL_ROLES, 'ops' => [
                                'getReservationForCopy' => STAFF,
                                'addReservation'        => BORROWERS]],
        'checkoverdues.php' => ['read' => BORROWERS],
    ];

    if(session_status() === PHP_SESSION_NONE){
        session_name('LMS_SESSION');
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/', //valid ang cookie sa tibuok domain, balag unsa pa na imong buhaton like mag trigger ug endpoint pwede ra kaayo borj
            'httponly' => true, //para maharangan ang client-side scripts sa pagbasa sa cookie, para nis XSS prevention
            'samesite' => 'Lax', //kani laban sa CSRF, so basically ayha ra ni iattach nga cookie kung gikan sa same website, para if ever nay malicious script ang pikas tab, di makuha imong session details
            'secure'   => !empty($_SERVER['HTTPS']) //kung https, true, kung dili, false, kailangan para di maguba bahalag http ra
        ]);
        session_start();
    }

    function deny($code, $message){
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($message);
        exit;
    }

    function destroySession(){
        $_SESSION = [];
        if(ini_get("session.use_cookies")){
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
    }

    function currentUserId(){
        return (int)($_SESSION['user_id'] ?? 0);
    }

    function currentRoleId(){
        return (int)($_SESSION['role_id'] ?? 0);
    }

    function sessionUserValid(){
        if(empty($_SESSION['user_id'])){
            return false;
        }
        if(isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_IDLE_SECONDS){
            destroySession();
            return false;
        }
        $_SESSION['last_activity'] = time();

        include __DIR__ . "/connection.php";
        $stmt = $conn->prepare("SELECT role_id, is_active, first_name, last_name FROM users WHERE user_id=:id");
        $stmt->bindValue(":id", (int)$_SESSION['user_id'], PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $conn = null;

        if(!$row || (int)$row['is_active'] !== 1){
            destroySession();
            return false;
        }

        $_SESSION['role_id']  = (int)$row['role_id'];
        $_SESSION['fullname'] = $row['first_name'] . " " . $row['last_name'];
        return true;
    }

    function requireLogin(){
        if(!sessionUserValid()){
            deny(401, "Not logged in");
        }
    }

    function requireRole(array $roles){
        requireLogin();
        if(!in_array(currentRoleId(), $roles, true)){
            deny(403, "Forbidden");
        }
    }

    function rolesFor($file, $operation){
        $rule = ACCESS[$file] ?? null;
        if($rule === null){
            return false;
        }
        if(isset($rule['ops']) && array_key_exists($operation, $rule['ops'])){
            return $rule['ops'][$operation];
        }
        $key = isReadOperation($operation) ? 'read' : 'write';
        if(isset($rule[$key])){
            return $rule[$key];
        }
        if(isset($rule['default'])){
            return $rule['default'];
        }
        return false;
    }

    function isReadOperation($operation){
        return (bool)preg_match('/^(get|search)/', $operation) || $operation === 'me';
    }

    function enforceAccess(){
        $file = basename($_SERVER['SCRIPT_NAME']);

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $operation = (string)($_POST['operation'] ?? '');
        }
        else{
            $operation = (string)($_GET['operation'] ?? '');
        }

        $roles = rolesFor($file, $operation);
        if($roles === false){
            deny(403, "Forbidden");
        }

        if(!isReadOperation($operation) && $_SERVER['REQUEST_METHOD'] !== 'POST'){
            deny(405, "POST required");
        }

        if($roles === null){
            return;
        }
        requireRole($roles);
    }

    function requirePage(array $roles){
        header('Cache-Control: no-store');

        if(!sessionUserValid()){
            header('Location: ' . APP_PATH . '/');
            exit;
        }
        if(!in_array(currentRoleId(), $roles, true)){
            header('Location: ' . (ROLE_HOME[currentRoleId()] ?? APP_PATH . '/'));
            exit;
        }
    }

    function resolveUserId($json){
        if(in_array(currentRoleId(), STAFF, true) && is_array($json) && !empty($json['user_id'])){
            return (int)$json['user_id'];
        }
        return currentUserId();
    }
?>