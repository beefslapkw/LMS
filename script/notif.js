(async function initNotifications() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    try {
        //fetch session details gamit me endpoint   
        const origin = window.location.origin;
        const res = await fetch(`${origin}/LMS/api/users.php?operation=me`, {
            credentials: 'include' //transmit LMS_SESSION cookie
        });

        if (!res.ok) {
            console.warn('[WS NOTIF] Session check failed or user not logged in.');
            return;
        }

        const user = await res.json();

        //check kung nay valid user payload
        if (!user || !user.user_id) {
            console.log('[WS NOTIF] No active user session found; skipping WebSocket.');
            return;
        }

        const isStaff = Number(user.role_id) === 1 || Number(user.role_id) === 2;
        const params = new URLSearchParams();

        if (isStaff) {
            params.append('role', 'staff');
        }
        params.append('userId', user.user_id);

        const ws = new WebSocket(`ws://localhost:8080?${params.toString()}`);

        ws.onopen = () => {
            console.log(`[WS NOTIF] Connected as ${isStaff ? 'Staff' : 'Borrower'} (User ID: ${user.user_id})`);

            if (!isStaff) {
                fetch(`${origin}/LMS/api/checkoverdues.php?operation=getMyOverdues`, {
                    credentials: 'include'
                }).catch(err => console.error('[WS NOTIF] Lazy check failed:', err));
            }
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                //new reservation
                if (message.type === 'NEW_RESERVATION') {
                    const data = message.data;

                    //SWAL alert
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: 'New Book Reservation!',
                            html: `<b>${data.borrower_name}</b> reserved <b>${data.book_count}</b> book(s).`,
                            showConfirmButton: false,
                            timer: 5000,
                            timerProgressBar: true
                        });
                    }

                    //taskbar desktop notif
                    if ('Notification' in window && Notification.permission === 'granted') {
                        const notif = new Notification('New Book Reservation!', {
                            body: `${data.borrower_name} reserved ${data.book_count} book(s).`,
                            icon: '../assets/images/logo.png',
                            requireInteraction: true
                        });
                        notif.onclick = () => window.focus();
                    }

                    //auto-refresh staff dashboard tables
                    if (typeof window.getAllReservations === 'function') {
                        window.getAllReservations();
                    }
                    if (typeof window.getAllCopies === 'function') {
                        window.getAllCopies();
                    }
                }

                //overdue book
                else if (message.type === 'OVERDUE_ALERT') {
                    const data = message.data;

                    //para maka receive ug array/single objec
                    const books = Array.isArray(data.books) ? data.books : (data.book_title ? [data] : []);
                    const count = data.count || books.length;

                    if (books.length === 0) return;

                    const bookItemsHtml = books.map(b => 
                        `<li style="text-align: left; margin-bottom: 8px;">
                            <b>${b.book_title || 'Unknown Title'}</b> (Accession: <code>${b.accession_number || 'N/A'}</code>)<br>
                            <span class="text-danger">${b.days_overdue || 0} day(s) overdue • Due: ${b.due_date || 'N/A'}</span>
                        </li>`
                    ).join('');

                    Swal.fire({
                        icon: 'warning',
                        title: `Overdue Books Warning (${count})`,
                        html: `You have <b>${count}</b> overdue item(s) that need immediate return:<br><br>
                            <ul style="padding-left: 20px;">${bookItemsHtml}</ul>
                            <small class="text-danger">Please return them to avoid accumulating further fines.</small>`,
                        confirmButtonText: 'I Understand',
                        confirmButtonColor: '#d33'
                    });
                }

            } catch (err) {
                console.error('[WS NOTIF] Error parsing message:', err);
            }
        };

        ws.onclose = () => {
            console.warn('[WS NOTIF] Connection closed. Attempting reconnect in 5 seconds...');
            setTimeout(initNotifications, 5000);
        };

        ws.onerror = (err) => {
            console.error('[WS NOTIF] WebSocket encountered an error:', err);
        };

    } catch (err) {
        console.error('[WS NOTIF] Initialization error:', err);
    }
})();