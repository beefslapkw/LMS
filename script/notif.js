(async function initNotifications() {
    //pangayo permission daan sa user kung wala pa na-grant
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

        //role 1 = head librarian, role 2 = student assistant
        const isStaff = Number(user.role_id) === 1 || Number(user.role_id) === 2;
        const params = new URLSearchParams();

        if (isStaff) {
            params.append('role', 'staff');
        }
        params.append('userId', user.user_id);

        //gamiton ang hostname imbes hardcoded localhost para mo-connect gihapon bisan sa phone/lan
        const wsHost = window.location.hostname || 'localhost';
        const ws = new WebSocket(`ws://${wsHost}:8080?${params.toString()}`);

        ws.onopen = () => {
            console.log(`[WS NOTIF] Connected as ${isStaff ? 'Staff' : 'Borrower'} (User ID: ${user.user_id})`);

            //lazy check para sa borrowers login, staff di na kailangan
            if (!isStaff) {
                fetch(`${origin}/LMS/api/checkoverdues.php?operation=getMyOverdues`, {
                    credentials: 'include'
                }).catch(err => console.error('[WS NOTIF] Lazy check failed:', err));
            }
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                //staff reservation
                if (message.type === 'NEW_RESERVATION') {
                    const data = message.data;

                    //SWAL toast popup sa kilid
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
                        try {
                            const notif = new Notification('New Book Reservation!', {
                                body: `${data.borrower_name} reserved ${data.book_count} book(s).`,
                                requireInteraction: true
                            });
                            notif.onclick = () => {
                                window.focus();
                                notif.close();
                            };
                        } catch (err) {
                            console.error('[WS NOTIF] Staff desktop notification error:', err);
                        }
                    }

                    //refresh tables sa dashboard para updated dayon
                    if (typeof window.getAllReservations === 'function') {
                        window.getAllReservations();
                    }
                    if (typeof window.getAllCopies === 'function') {
                        window.getAllCopies(); //makuhaan ang available copies count
                    }
                }

                //overdue books alert
                else if (message.type === 'OVERDUE_ALERT') {
                    const data = message.data;
                    //handle kung array or single object ra ang nisulod
                    const books = Array.isArray(data.books) ? data.books : (data.book_title ? [data] : []);
                    const count = data.count || books.length;

                    //modal alert nga gi-combine tanan overdue books
                    if (typeof Swal !== 'undefined' && books.length > 0) {
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
                                <small class="text-danger">Please return them to avoid escalating fines.</small>`,
                            confirmButtonText: 'I Understand',
                            confirmButtonColor: '#d33'
                        });
                    }

                    //taskbar/system notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        try {
                            const notif = new Notification('Library Notice: Overdue Books', {
                                body: `You have ${count} overdue book(s). Please return them to avoid accumulating fines.`,
                                requireInteraction: true
                            });

                            notif.onclick = () => {
                                window.focus();
                                notif.close();
                            };
                        } catch (err) {
                            console.error('[WS NOTIF] Failed to show OS notification:', err);
                        }
                    }
                }

            } catch (err) {
                console.error('[WS NOTIF] Error parsing message:', err);
            }
        };

        //reconnect automatically pag maputol ang socket server
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