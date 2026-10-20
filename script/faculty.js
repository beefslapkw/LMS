const url = `${location.origin}/LMS/api`;
sessionStorage.setItem("url", url);

//ang ngalan gikan sa verified session
authReady.then(me => {
    document.getElementById('welcome').textContent = `Welcome, Faculty ${me.fullname}`;
});

let allBooks = []; 

const renderPagination = (container, curPage, totalPages, goTo) => {
    if(totalPages <= 1) return;

    const pagination = document.createElement('div');
    pagination.classList.add('d-flex', 'justify-content-center', 'gap-2', 'mt-2');

    const addBtn = (label, page, active = false, disabled = false) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.className = active ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-secondary';
        btn.disabled = disabled;
        btn.addEventListener('click', () => goTo(page));
        pagination.appendChild(btn);
    };

    addBtn('Prev', curPage - 1, false, curPage <= 1);

    const start = Math.max(1, curPage - 2);
    const end = Math.min(totalPages, curPage + 2);

    if(start > 1){
        addBtn('1', 1);
        if(start > 2) addBtn('...', curPage, false, true);
    }
    for(let i = start; i <= end; i++){
        addBtn(i, i, i === curPage);
    }
    if(end < totalPages){
        if(end < totalPages - 1) addBtn('...', curPage, false, true);
        addBtn(totalPages, totalPages);
    }

    addBtn('Next', curPage + 1, false, curPage >= totalPages);

    container.appendChild(pagination);
};


let currentCatalogPage = 1;
const booksPerPage = 10;

const getCatalog = async(page = 1) => {
    currentCatalogPage = page;

    const response = await axios.get(`${url}/books.php`,{
        params:{operation:"getAllBooks", json: JSON.stringify({ page: page, limit: booksPerPage })}
    })

    if(response.status == 200){
        console.log(response.data.data);
        allBooks = response.data;
        console.log(allBooks);
        renderCatalog(allBooks);
    }
    else{
        alert("ERROR");
    }
}

const renderCatalog = (books) => {
    const catalogtablediv = document.getElementById('catalogtablediv');
    catalogtablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Book Title</th>
            <th>Genre</th>
            <th>Authors</th>
            <th>Category</th>
            <th>Publisher</th>
            <th>Shelf Location</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    books.data.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.book_title}</td>
            <td>${book.genre_name}</td>
            <td>${book.authors}</td>
            <td>${book.category_type}</td>
            <td>${book.publisher_name}</td>
            <td>${book.shelf_location}</td>
        `;
        tbody.appendChild(row);
    })

    table.appendChild(tbody);
    catalogtablediv.appendChild(table);

    renderPagination(catalogtablediv, books.page, books.totalPages, getCatalog);
}

document.getElementById('searchbar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    const filtered = allBooks.data.filter(book =>
        (book.book_title || "").toLowerCase().includes(query) ||
        (book.authors || "").toLowerCase().includes(query) ||
        (book.genre_name || "").toLowerCase().includes(query)
    );

    renderCatalog({ ...allBooks, data: filtered });
});

let currentBorrowedPage = 1;
const borrowedPerPage = 10;
let borrowedfilter = 'all';

const borrowedStatusBadges = {
    active:   '<span class="badge bg-success">Active</span>',
    overdue:  '<span class="badge bg-danger">Overdue</span>',
    returned: '<span class="badge bg-secondary">Returned</span>'
};

const getMyBorrowedBooks = async(page = 1) => {
    currentBorrowedPage = page;
    const borrowedtablediv = document.getElementById('borrowedtablediv');

    const response = await axios.get(`${url}/student.php`,{
        params:{operation:"getBorrowedBooks", json: JSON.stringify({ user_id: sessionStorage.userId, status: borrowedfilter, page: page, limit: borrowedPerPage })}
    })

    borrowedtablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession Number</th>
            <th>Book Title</th>
            <th>Borrowed At</th>
            <th>Due Date</th>
            <th>Returned At</th>
            <th>Processed By</th>
            <th>Status</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    console.log(response.data);
    if(response.status == 200){
        console.log(response.data);
        if(response.data.data.length === 0){
            const empty = document.createElement('tr');
            empty.innerHTML = `<td colspan="7" class="text-center text-muted py-3">No borrowed books found.</td>`;
            tbody.appendChild(empty);
        }
        response.data.data.forEach(borrow => {
            let returnedAt;
            if(!borrow.returned_at){
                returnedAt = "-";
            }
            else{
                returnedAt = borrow.returned_at;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${borrow.accession_number}</td>
                <td>${borrow.book_title}</td>
                <td>${borrow.borrowed_at}</td>
                <td>${borrow.expires_at}</td>
                <td>${returnedAt}</td>
                <td>${borrow.processed_by_first_name + " " + borrow.processed_by_last_name}</td>
                <td>${borrowedStatusBadges[borrow.status]}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        borrowedtablediv.appendChild(table);

        renderPagination(borrowedtablediv, response.data.page, response.data.totalPages, getMyBorrowedBooks);
    }
    else{
        alert("ERROR");
    } 
}

let currentFinesPage = 1;
const finesPerPage = 10;

const getMyFines = async(page = 1) => {
    currentFinesPage = page;
    const finestablediv = document.getElementById('finestablediv');

    const response = await axios.get(`${url}/student.php`,{
        params:{operation:"getFines", json: JSON.stringify({ user_id: sessionStorage.userId, status: 'unpaid', page: page, limit: finesPerPage })}
    })

    finestablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession Number</th>
            <th>Book Title</th>
            <th>Days Late</th>
            <th>Fine Amount</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        if(response.data.data.length === 0){
            const empty = document.createElement('tr');
            empty.innerHTML = `<td colspan="4" class="text-center text-muted py-3">No unpaid fines.</td>`;
            tbody.appendChild(empty);
        }
        response.data.data.forEach(fine => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fine.accession_number}</td>
                <td>${fine.book_title}</td>
                <td>${fine.days_late}</td>
                <td>${fine.fine_amount}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        finestablediv.appendChild(table);

        renderPagination(finestablediv, response.data.page, response.data.totalPages, getMyFines);
    }
    else{
        alert("ERROR");
    }
}

let currentPaymentsPage = 1;
const paymentsPerPage = 10;

const getPaymentHistory = async(page = 1) => {
    currentPaymentsPage = page;
    const paymenthistorytablediv = document.getElementById('paymenthistorytablediv');

    const response = await axios.get(`${url}/student.php`,{
        params:{operation:"getFines", json: JSON.stringify({ user_id: sessionStorage.userId, status: 'paid', page: page, limit: paymentsPerPage })}
    })

    paymenthistorytablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession Number</th>
            <th>Book Title</th>
            <th>Days Late</th>
            <th>Fine Amount</th>
            <th>Paid At</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        if(response.data.data.length === 0){
            const empty = document.createElement('tr');
            empty.innerHTML = `<td colspan="5" class="text-center text-muted py-3">No payment history.</td>`;
            tbody.appendChild(empty);
        }
        response.data.data.forEach(fine => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fine.accession_number}</td>
                <td>${fine.book_title}</td>
                <td>${fine.days_late}</td>
                <td>${fine.fine_amount}</td>
                <td>${fine.paid_at}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        paymenthistorytablediv.appendChild(table);

        renderPagination(paymenthistorytablediv, response.data.page, response.data.totalPages, getPaymentHistory);
    }
    else{
        alert("ERROR");
    }
}

const getFineBalance = async() => {
    const response = await axios.get(`${url}/student.php`,{
        params:{operation:"getFineBalance", json: JSON.stringify({ user_id: sessionStorage.userId })}
    })

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('finebalance').innerText = Number(response.data.balance).toFixed(2);
    }
}

const getAvailableCount = async() => {
    const response = await axios.get(`${url}/bookcopies.php`,{
        params:{operation:"getAvailableCount"}
    })

    if(response.status == 200){
        document.getElementById('availablecount').innerText = response.data;
    }
}

const getBorrowedCount = async() => {
    const response = await axios.get(`${url}/student.php`,{
        params:{operation:"getBorrowedCount", json: JSON.stringify({ user_id: sessionStorage.userId })}
    })

    if(response.status == 200){
        document.getElementById('borrowedcount').innerText = response.data;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCatalog();
    document.getElementById('borrowedfilter').addEventListener('change', (e) => {
        borrowedfilter = e.target.value;
        getMyBorrowedBooks(1);
    })
    getMyBorrowedBooks();
    getBorrowedCount();
    getMyFines();
    getPaymentHistory();
    getFineBalance();
    getAvailableCount();
})