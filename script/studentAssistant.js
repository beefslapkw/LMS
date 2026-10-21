import { startBorrow } from "./borrowtransactionmodules/borrow.js";
import { startReturn } from "./returntransactionmodules/return.js";
import { startRenew } from "./renewalmodules/renewal.js";

import { addBook } from "./bookmodules/add.js";
import { viewBook } from "./bookmodules/view.js";
import { updateBook } from "./bookmodules/update.js";
import { deactivateBook } from "./bookmodules/deactivate.js";
import { reactivateBook } from "./bookmodules/reactivate.js";

import { addCopy } from "./bookcopymodules/add.js";
import { viewCopy } from "./bookcopymodules/view.js";
import { updateCopy } from "./bookcopymodules/update.js";

import { addAuthor } from "./authorsmodules/add.js";
import { viewAuthor } from "./authorsmodules/view.js";
import { updateAuthor } from "./authorsmodules/update.js";

import { addPublisher } from "./publishermodules/add.js";
import { viewPublisher } from "./publishermodules/view.js";
import { updatePublisher } from "./publishermodules/update.js";

//walay users, disposal, ug uban nga lookup tables diri bords kay head librarian ra ang mo-manage ana

const url = `${location.origin}/LMS/api`;
sessionStorage.setItem("url", url);

const fetchAllRows = async(file, operation, extraParams = {}) => {
    let rows = [];
    let page = 1;
    let totalPages = 1;

    do{
        const response = await axios.get(`${url}/${file}`,{
            params:{operation: operation, json: JSON.stringify({ page: page, limit: 100, ...extraParams })}
        })
        rows = rows.concat(response.data.data);
        totalPages = response.data.totalPages;
        page++;
    } while(page <= totalPages);

    return rows;
}

const loadAuthors = () => fetchAllRows('authors.php', 'getAllAuthors', { active_only: 1 });
const loadPublishers = () => fetchAllRows('publishers.php', 'getAllPublishers', { active_only: 1 });
const loadGenres = () => fetchAllRows('genres.php', 'getAllGenres', { active_only: 1 });
const loadCategories = () => fetchAllRows('categories.php', 'getAllCategories', { active_only: 1 });
const loadConditions = () => fetchAllRows('conditions.php', 'getAllConditions', { active_only: 1 });

//author/category/genre/publisher lists para sa add/update book modals
const loadBookLists = () => Promise.all([loadAuthors(), loadCategories(), loadGenres(), loadPublishers()]);
let activeborrows = [];

authReady.then(me => {
    document.getElementById('welcome').textContent = `Welcome, Student Assistant ${me.fullname}`;
});

//container - ang div, curPage - ang current page, totalPages - ang total rows/limit gikan sa api, goTo - ang function (ex: getAllBooks)
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

//========================= BOOKS =========================
let currentBooksPage = 1;
const booksPerPage = 10;
let booksearch = '';
let booksearchtimer;

const getAllBooks = async(page = 1) => {
    currentBooksPage = page;
    const bookstablediv = document.getElementById('bookstablediv');

    const response = await axios.get(`${url}/books.php`,{
        params:{
            operation: booksearch ? "searchBooks" : "getAllBooks",
            json: JSON.stringify({ page: page, limit: booksPerPage, search: booksearch })
        }
    })

    bookstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Book Title</th>
            <th>Genre</th>
            <th>Authors</th>
            <th>Category</th>
            <th>Shelf Location</th>
            <th>Publisher</th>
            <th>Added By</th>
            <th>Added At</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('bookscard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #006666;">
                <small class="text-uppercase fw-semibold">Total Books Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.total}</h2>
            </div>
        `;
        response.data.data.forEach(book => { 
            let status;
            let statusButtons;
            if(book.is_active == 1){
                status = "Active";
                statusButtons = `<button class="btn btn-danger btn-sm deactivate">De-activate</button>`;
            }
            else if(book.is_active == 0){
                status = "Inactive";
                statusButtons = `<button class="btn btn-primary btn-sm reactivate">Re-activate</button>`;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_title}</td>
                <td>${book.genre_name}</td>
                <td>${book.authors}</td>
                <td>${book.category_type}</td>
                <td>${book.shelf_location}</td>
                <td>${book.publisher_name}</td>
                <td>${book.first_name + " " + book.last_name}</td>
                <td>${book.added_at}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                    ${statusButtons}
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewBook(book.book_id);
            })

            //mabalik sa current page imbes page 1
            row.querySelector(".update").addEventListener('click', () => {
                loadBookLists().then(([authors, categories, genres, publishers]) => updateBook(book.book_id, authors, categories, genres, publishers, () => getAllBooks(currentBooksPage)));
            })
            
            const deactivateBtn = row.querySelector(".deactivate");
            if(deactivateBtn){
                deactivateBtn.addEventListener('click', () => {
                    deactivateBook(book.book_id, () => getAllBooks(currentBooksPage));
                })
            }
            
            const reactivateBtn = row.querySelector(".reactivate");
            if(reactivateBtn){
                reactivateBtn.addEventListener('click', () => {
                    reactivateBook(book.book_id, () => getAllBooks(currentBooksPage));
                })
            }
        })
        table.appendChild(tbody);
        bookstablediv.appendChild(table);

        renderPagination(bookstablediv, response.data.page, response.data.totalPages, getAllBooks);
    }
    else{
        alert("ERROR");
    }
}

//========================= BOOK COPIES =========================
let currentCopiesPage = 1;
const copiesPerPage = 10;
let copysearch = '';
let copysearchtimer;

const getAllCopies = async(page = 1) => {
    currentCopiesPage = page;
    const copiestablediv = document.getElementById('copiestablediv');

    const response = await axios.get(`${url}/bookcopies.php`,{
        params:{
            operation: copysearch ? "searchCopies" : "getAllCopies",
            json: JSON.stringify({ page: page, limit: copiesPerPage, search: copysearch })
        }
    })

    copiestablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Book Title</th>
            <th>Accession Number</th>
            <th>Condition</th>
            <th>Condition Notes</th>
            <th>Added By</th>
            <th>Added At</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('copiescard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #00a8a8;">
                <small class="text-uppercase fw-semibold">Total Book Copies Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.total}</h2>
            </div>
        `;
        response.data.data.forEach(copy => { 
            let condition;
            if(!copy.condition_notes){
                condition = "N/A";
            }
            else{
                condition = copy.condition_notes;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${copy.book_title}</td>
                <td>${copy.accession_number}</td>
                <td>${copy.condition_desc}</td>
                <td>${condition}</td>
                <td>${copy.first_name + " " + copy.last_name}</td>
                <td>${copy.added_at}</td>
                <td>${copy.status_desc}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewCopy(copy.copy_id);
            })

            //mabalik sa current page imbes page 1
            row.querySelector(".update").addEventListener('click', () => {
                loadConditions().then(conditions => updateCopy(copy.copy_id, conditions, () => getAllCopies(currentCopiesPage)));
            })
        })
        table.appendChild(tbody);
        copiestablediv.appendChild(table);

        renderPagination(copiestablediv, response.data.page, response.data.totalPages, getAllCopies);
    }
    else{
        alert("ERROR");
    }
}

window.getAllCopies = getAllCopies;

//========================= AUTHORS =========================
let currentAuthorsPage = 1;
const authorsPerPage = 10;

const getAllAuthors = async(page = 1) => {
    currentAuthorsPage = page;
    const authorstablediv = document.getElementById('authorstablediv');

    const response = await axios.get(`${url}/authors.php`,{
        params:{operation:"getAllAuthors", json: JSON.stringify({ page: page, limit: authorsPerPage })}
    })

    authorstablediv.innerHTML = "";

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Author Name</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('authorscard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #e68a00;">
                <small class="text-uppercase fw-semibold">Total Authors Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.total}</h2>
            </div>
        `;
        response.data.data.forEach(author => { 
            const status = author.is_active == 1 ? "Active" : "Inactive";
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.author_name}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewAuthor(author.author_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateAuthor(author.author_id, () => getAllAuthors(currentAuthorsPage));
            })
        })
        table.appendChild(tbody);
        authorstablediv.appendChild(table);

        renderPagination(authorstablediv, response.data.page, response.data.totalPages, getAllAuthors);
    }
    else{
        alert("ERROR");
    }
}

//========================= PUBLISHERS =========================
let currentPublishersPage = 1;
const publishersPerPage = 10;

const getAllPublishers = async(page = 1) => {
    currentPublishersPage = page;
    const publisherstablediv = document.getElementById('publisherstablediv');

    const response = await axios.get(`${url}/publishers.php`,{
        params:{operation:"getAllPublishers", json: JSON.stringify({ page: page, limit: publishersPerPage })}
    })

    publisherstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Publisher Name</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('publisherscard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #00a8a8;">
                <small class="text-uppercase fw-semibold">Total Publishers Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.total}</h2>
            </div>
        `;
        response.data.data.forEach(publisher => { 
            const status = publisher.is_active == 1 ? "Active" : "Inactive";
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${publisher.publisher_name}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewPublisher(publisher.publisher_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updatePublisher(publisher.publisher_id, () => getAllPublishers(currentPublishersPage));
            })
        })
        table.appendChild(tbody);
        publisherstablediv.appendChild(table);

        renderPagination(publisherstablediv, response.data.page, response.data.totalPages, getAllPublishers);
    }
    else{
        alert("ERROR");
    }
}

//========================= BORROWS =========================
let currentBorrowsPage = 1;
const borrowsPerPage = 10;
let borrowfilter = 'active'; 

const borrowStatusBadges = {
    active:   '<span class="badge bg-success">Active</span>',
    overdue:  '<span class="badge bg-danger">Overdue</span>',
    returned: '<span class="badge bg-secondary">Returned</span>'
};

const getAllBorrows = async(page = 1) => {
    currentBorrowsPage = page;
    const borrowstablediv = document.getElementById('borrowstablediv');

    try{
        const [response, outstanding] = await Promise.all([
            axios.get(`${url}/borrowtransactions.php`,{
                params:{operation:"getAllBorrowTransactions", json: JSON.stringify({ page: page, limit: borrowsPerPage, status: borrowfilter })}
            }),
            axios.get(`${url}/borrowtransactions.php`,{
                params:{operation:"getAllBorrowTransactions", json: JSON.stringify({ status: 'outstanding' })}
            })
        ]);

        if(response.status == 200 && outstanding.status == 200){
            activeborrows = outstanding.data.data;

            borrowstablediv.innerHTML = '';

            const table = document.createElement('table');
            table.classList.add("table", "table-hover", "table-striped", "table-sm");
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Accession Number</th>
                        <th>Book Title</th>
                        <th>Borrower</th>
                        <th>Borrowed At</th>
                        <th>Due Date</th>
                        <th>Processed By</th>
                        <th>Status</th>
                    </tr>
                </thead>
            `;
            const tbody = document.createElement('tbody');

            if(response.data.data.length === 0){
                const empty = document.createElement('tr');
                empty.innerHTML = `<td colspan="7" class="text-center text-muted py-3">No ${borrowfilter === 'all' ? '' : borrowfilter + ' '}borrows found.</td>`;
                tbody.appendChild(empty);
            }

            response.data.data.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.accession_number}</td>
                    <td>${transaction.book_title}</td>
                    <td>${transaction.borrower_first_name + " " + transaction.borrower_last_name}</td>
                    <td>${transaction.borrowed_at}</td>
                    <td>${transaction.expires_at}</td>
                    <td>${transaction.processed_by_first_name + " " + transaction.processed_by_last_name}</td>
                    <td>${borrowStatusBadges[transaction.status]}</td>
                `;
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            borrowstablediv.appendChild(table);

            currentBorrowsPage = response.data.page; 
            renderPagination(borrowstablediv, response.data.page, response.data.totalPages, getAllBorrows);
        }
        else{
            alert("ERROR");
        }
    }
    catch(error){
        console.error(error);
        alert("ERROR");
    }
}

//========================= RETURNS =========================
let currentReturnsPage = 1;
const returnsPerPage = 10;

const getAllReturns = async(page = 1) => {
    currentReturnsPage = page;
    const returnstablediv = document.getElementById('returnstablediv');

    const response = await axios.get(`${url}/returntransactions.php`,{
        params:{operation:"getAllReturnTransactions", json: JSON.stringify({ page: page, limit: returnsPerPage })}
    })

    returnstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession Number</th>
            <th>Book Title</th>
            <th>Borrower</th>
            <th>Due Date</th>
            <th>Returned At</th>
            <th>Condition on Return</th>
            <th>Condition Notes</th>
            <th>Received By</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        response.data.data.forEach(transaction => { 
            let notes;
            if(!transaction.condition_notes){
                notes = "N/A";
            }
            else{
                notes = transaction.condition_notes;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.accession_number}</td>
                <td>${transaction.book_title}</td>
                <td>${transaction.borrower_first_name + " " + transaction.borrower_last_name}</td>
                <td>${transaction.expires_at}</td>
                <td>${transaction.returned_at}</td>
                <td>${transaction.condition_desc}</td>
                <td>${notes}</td>
                <td>${transaction.received_by_first_name + " " + transaction.received_by_last_name}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        returnstablediv.appendChild(table);

        renderPagination(returnstablediv, response.data.page, response.data.totalPages, getAllReturns);
    }
    else{
        alert("ERROR");
    }
}

//========================= RENEWALS =========================
let currentRenewalsPage = 1;
const renewalsPerPage = 10;

const getAllRenewals = async(page = 1) => {
    currentRenewalsPage = page;
    const renewalstablediv = document.getElementById('renewalstablediv');

    const response = await axios.get(`${url}/renewals.php`,{
        params:{operation:"getAllRenewals", json: JSON.stringify({ page: page, limit: renewalsPerPage })}
    })

    renewalstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession Number</th>
            <th>Book Title</th>
            <th>Borrower</th>
            <th>Old Due Date</th>
            <th>New Due Date</th>
            <th>Renewed At</th>
            <th>Renewed By</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        response.data.data.forEach(transaction => { 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.accession_number}</td>
                <td>${transaction.book_title}</td>
                <td>${transaction.borrower_first_name + " " + transaction.borrower_last_name}</td>
                <td>${transaction.old_due_date}</td>
                <td>${transaction.new_due_date}</td>
                <td>${transaction.renewed_at}</td>
                <td>${transaction.renewed_by_first_name + " " + transaction.renewed_by_last_name}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        renewalstablediv.appendChild(table);

        renderPagination(renewalstablediv, response.data.page, response.data.totalPages, getAllRenewals);
    }
    else{
        alert("ERROR");
    }
}

//========================= FINES =========================
let currentFinesPage = 1;
const finesPerPage = 10;

const getAllFines = async(page = 1) => {
    currentFinesPage = page;
    const finestablediv = document.getElementById('finestablediv');

    const response = await axios.get(`${url}/fines.php`,{
        params:{operation:"getAllFines", json: JSON.stringify({ page: page, limit: finesPerPage })}
    })

    finestablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession Number</th>
            <th>Book Title</th>
            <th>Borrower</th>
            <th>Days Late</th>
            <th>Fine Amount</th>
            <th>Status</th>
            <th>Paid At</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        response.data.data.forEach(fine => { 
            let paidAt;
            if(!fine.paid_at){
                paidAt = "-";
            }
            else{
                paidAt = fine.paid_at;
            }
            let paybutton = '';
            if(fine.is_paid == 0){
                paybutton= `<button class="btn btn-success btn-sm pay">Pay</button>`;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fine.accession_number}</td>
                <td>${fine.book_title}</td>
                <td>${fine.first_name + " " + fine.last_name}</td>
                <td>${fine.days_late}</td>
                <td>${fine.fine_amount}</td>
                <td>${fine.is_paid == 1 ? "Paid" : "Unpaid"}</td>
                <td>${paidAt}</td>
                <td>
                    ${paybutton}
                </td>
            `;
            tbody.appendChild(row);
            
            const payBtn = row.querySelector(".pay");
            if(payBtn){
                payBtn.addEventListener('click', async() => {
                    const confirmed = confirm(`Mark this fine of ${fine.fine_amount} as paid?`);
                    if(!confirmed){
                        return;
                    }

                    if(await payFineDetails(fine.fine_id) == 1){
                        getAllFines(currentFinesPage);
                        Swal.fire({
                            title: 'Success',
                            text: "Fine paid successfully",
                            icon: 'success'
                        })
                    }
                    else{
                        Swal.fire({
                            title: 'Failed',
                            text: "Fine payment failed",
                            icon: 'error'
                        })
                    }
                })
            }
        })
        table.appendChild(tbody);
        finestablediv.appendChild(table);

        renderPagination(finestablediv, response.data.page, response.data.totalPages, getAllFines);
    }
    else{
        alert("ERROR");
    }
}

const payFineDetails = async(fine_id) => {
    const jsondata = { 
        fine_id: fine_id 
    };

    const formData = new FormData();
    formData.append('operation', "payFine");
    formData.append('json', JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/fines.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}

//========================= RESERVATIONS =========================
let reservationfilter = 'active';
let currentReservationsPage = 1;
const reservationsPerPage = 10;

const getAllReservations = async(page = 1) => {
    currentReservationsPage = page;
    const reservationstablediv = document.getElementById('reservationstablediv');

    const response = await axios.get(`${url}/reservationtransactions.php`,{
        params:{operation:"getAllReservations", json: JSON.stringify({ page: page, limit: reservationsPerPage, status: reservationfilter })}
    })

    reservationstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession No.</th>
            <th>Book Title</th>
            <th>Reserved By</th>
            <th>Reserved At</th>
            <th>Pick Up Until</th>
            <th>Status</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        response.data.data.forEach(reservation => {
            let cancelbutton = '';
            if(reservation.reservation_status_desc == "Active"){
                cancelbutton = `<button class="btn btn-danger btn-sm cancel">Cancel</button>`;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reservation.accession_number}</td>
                <td>${reservation.book_title}</td>
                <td>${reservation.borrower_first_name + " " + reservation.borrower_last_name}</td>
                <td>${reservation.reserved_at}</td>
                <td>${reservation.expires_at}</td>
                <td>${reservation.reservation_status_desc}</td>
                <td>${cancelbutton}</td>
            `;
            tbody.appendChild(row);

            const cancelBtn = row.querySelector(".cancel");
            if(cancelBtn){
                cancelBtn.addEventListener('click', async() => {
                    const confirmed = confirm(`Cancel the reservation of "${reservation.book_title}" for ${reservation.borrower_first_name} ${reservation.borrower_last_name}?`);
                    if(!confirmed){
                        return;
                    }

                    const result = await cancelReservationItem(reservation.reservation_item_id);
                    if(result == 1){
                        getAllReservations(currentReservationsPage);
                        getAllCopies(currentCopiesPage);
                        Swal.fire({
                            title: 'Success',
                            text: "Reservation cancelled",
                            icon: 'success'
                        })
                    }
                    else{
                        Swal.fire({
                            title: 'Failed',
                            text: result || "Failed to cancel reservation",
                            icon: 'error'
                        })
                    }
                })
            }
        })
        table.appendChild(tbody);
        reservationstablediv.appendChild(table);

        renderPagination(reservationstablediv, response.data.page, response.data.totalPages, getAllReservations);
    }
    else{
        alert("ERROR");
    }
}

window.getAllReservations = getAllReservations;

const cancelReservationItem = async(reservation_item_id) => {
    const jsondata = {
        reservation_item_id: reservation_item_id
    };

    const formData = new FormData();
    formData.append('operation', "cancelReservationItem");
    formData.append('json', JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/reservationtransactions.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}

document.addEventListener('DOMContentLoaded', async() => {
    await Promise.all([
        getAllAuthors(),
        getAllPublishers()
    ]);

    getAllBooks();
    getAllCopies();
    getAllBorrows();
    getAllReturns();
    getAllRenewals();
    getAllReservations();
    getAllFines();

    document.getElementById('startborrow').addEventListener('click', () => {
        startBorrow(() => {
            getAllBorrows();
            getAllCopies(currentCopiesPage);
        });
    })
    document.getElementById('startreturn').addEventListener('click', async() => {
        startReturn(activeborrows, await loadConditions(), () => {
            getAllBorrows();
            getAllCopies(currentCopiesPage);
        }, getAllReturns, getAllFines);
    })
    document.getElementById('startrenew').addEventListener('click', () => {
        startRenew(activeborrows, getAllBorrows, getAllRenewals);
    })
    document.getElementById('addbook').addEventListener('click', () => {
        loadBookLists().then(([authors, categories, genres, publishers]) => addBook(authors, categories, genres, publishers, () => getAllBooks(currentBooksPage)));
    })
    document.getElementById('addcopy').addEventListener('click', () => {
        addCopy(() => getAllCopies(currentCopiesPage));
    })
    document.getElementById('addauthor').addEventListener('click', () => {
        addAuthor(() => getAllAuthors(currentAuthorsPage));
    }) 
    document.getElementById('addpublisher').addEventListener('click', () => {
        addPublisher(() => getAllPublishers(currentPublishersPage));
    })
    document.getElementById('borrowfilter').addEventListener('change', (e) => {
        borrowfilter = e.target.value;
        getAllBorrows(1);
    })
    document.getElementById('booksearch').addEventListener('input', (e) => {
        clearTimeout(booksearchtimer);
        booksearchtimer = setTimeout(() => {
            booksearch = e.target.value.trim();
            getAllBooks(1);
        }, 300);
    })
    document.getElementById('copysearch').addEventListener('input', (e) => {
        clearTimeout(copysearchtimer);
        copysearchtimer = setTimeout(() => {
            copysearch = e.target.value.trim();
            getAllCopies(1);
        }, 300);
    })
    document.getElementById('reservationfilter').addEventListener('change', (e) => {
        reservationfilter = e.target.value;
        getAllReservations(1);
    })
})