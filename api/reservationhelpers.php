<?php
    define('RESERVATION_DAYS', 2);

    //kwaon ang ID sa usa ka lookup row (ex: status_id sa "Reserved"), return 0 kung wala
    function lookupId(PDO $conn, $sql){
        return (int)$conn->query($sql)->fetchColumn();
    }

    function getCopyStatusId(PDO $conn, $desc){
        $stmt = $conn->prepare("SELECT status_id FROM statuses WHERE status_desc=:desc");
        $stmt->bindValue(":desc", $desc);
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    function getReservationStatusId(PDO $conn, $desc){
        $stmt = $conn->prepare("SELECT reservation_status_id FROM reservation_statuses WHERE reservation_status_desc=:desc");
        $stmt->bindValue(":desc", $desc);
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    //lazy expiry: iflip ang tanan nga Active nga reservation items nga lapas na sa expires_at
    //ang copy mobalik sa Available (kung Reserved pa gyud)
    //ang reservation item mahimong Expired
    //tawagon ni sa sinugdan sa mga endpoints nga naka depende sa copy/reservation status
    function expireReservations(PDO $conn){
        $ownTransaction = !$conn->inTransaction();
        if($ownTransaction){
            $conn->beginTransaction();
        }

        try{
            $availableId = getCopyStatusId($conn, 'Available');
            $reservedId  = getCopyStatusId($conn, 'Reserved');
            $activeId    = getReservationStatusId($conn, 'Active');
            $expiredId   = getReservationStatusId($conn, 'Expired');

            //copies una, kay nag depende pa sa Active nga status sa reservation item
            $sqlCopies = "UPDATE book_copies bc
                        INNER JOIN reservation_items ri ON ri.copy_id=bc.copy_id
                        INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                        SET bc.status_id=:available
                        WHERE ri.reservation_status_id=:active
                        AND rt.expires_at < NOW()
                        AND bc.status_id=:reserved";
            $stmtCopies = $conn->prepare($sqlCopies);
            $stmtCopies->bindValue(":available", $availableId, PDO::PARAM_INT);
            $stmtCopies->bindValue(":active", $activeId, PDO::PARAM_INT);
            $stmtCopies->bindValue(":reserved", $reservedId, PDO::PARAM_INT);
            $stmtCopies->execute();

            $sqlItems = "UPDATE reservation_items ri
                        INNER JOIN reservation_transactions rt ON ri.reservation_id=rt.reservation_id
                        SET ri.reservation_status_id=:expired
                        WHERE ri.reservation_status_id=:active
                        AND rt.expires_at < NOW()";
            $stmtItems = $conn->prepare($sqlItems);
            $stmtItems->bindValue(":expired", $expiredId, PDO::PARAM_INT);
            $stmtItems->bindValue(":active", $activeId, PDO::PARAM_INT);
            $stmtItems->execute();

            if($ownTransaction){
                $conn->commit();
            }
        }
        catch(Exception $e){
            if($ownTransaction && $conn->inTransaction()){
                $conn->rollBack();
            }
            throw $e;
        }
    }

    //parehas sa expireReservations pero dili mag-throw; gamit sa mga read endpoints (copies, counts)
    function safeExpireReservations(PDO $conn){
        try{
            expireReservations($conn);
        }
        catch(Exception $e){
            //ayaw iblock ang read kung naguba ang expiry
        }
    }

    function pushWebSocketNotification(string $endpoint, array $payload): void {
        $ch = curl_init("http://127.0.0.1:8080" . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT_MS, 500); //fast timeout para dili mo hinay ang req sa borrower
        curl_exec($ch);
        curl_close($ch);
    }
?>