const http = require('http');
const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

//mga connected nga staff clients (Head Librarian ug Student Assistant)
const staffClients = new Set();

//mga connected nga borrowers (userId -> Set of WebSocket tabs)
const userClients = new Map();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const role = url.searchParams.get('role');
    const userId = url.searchParams.get('userId');

    //iregister kung staff (para sa reservation notifications)
    if(role === 'staff'){
        staffClients.add(ws);
        console.log(`[WS] Staff connected. Active staff tabs: ${staffClients.size}`);
    }

    //iregister kung borrower / user (para sa overdue notifications)
    if(userId){
        if (!userClients.has(userId)) {
            userClients.set(userId, new Set());
        }
        userClients.get(userId).add(ws);
        console.log(`[WS] User ${userId} connected. Active tabs for this user: ${userClients.get(userId).size}`);
    }

    ws.on('close', () => {
        //clear staff set
        if (role === 'staff') {
            staffClients.delete(ws);
            console.log(`[WS] Staff disconnected. Active staff tabs: ${staffClients.size}`);
        }

        //clear user map
        if (userId && userClients.has(userId)) {
            const tabs = userClients.get(userId);
            tabs.delete(ws);
            if (tabs.size === 0) {
                userClients.delete(userId);
            }
            console.log(`[WS] User ${userId} tab closed.`);
        }
    });
});

//reservation trigger gikan sa PHP (Broadcast sa tanan staff)
app.post('/api/notify-reservation', (req, res) => {
    const payload = JSON.stringify({
        type: 'NEW_RESERVATION',
        data: req.body
    });

    let sent = 0;
    staffClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
            sent++;
        }
    });

    console.log(`[WS] Broadcasted reservation to ${sent} staff member(s).`);
    return res.status(200).json({ status: 'broadcasted', count: sent });
});

//overdue alert trigger gikan sa PHP (Targeted sa specific borrower ra)
app.post('/api/notify-overdue', (req, res) => {
    const { borrower_id } = req.body;

    if (!borrower_id) {
        return res.status(400).json({ error: 'Missing borrower_id' });
    }

    const payload = JSON.stringify({
        type: 'OVERDUE_ALERT',
        data: req.body //borrower_id, count, books array, and any single-book fallbacks
    });

    const targetTabs = userClients.get(String(borrower_id));
    let sent = 0;

    if (targetTabs && targetTabs.size > 0) {
        targetTabs.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
                sent++;
            }
        });
    }

    console.log(`[WS] Overdue notice sent to borrower ID ${borrower_id} (${sent} tab(s) active).`);
    return res.status(200).json({ status: 'sent', delivered_tabs: sent });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Notification WebSocket server running on port ${PORT}`);
});