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
import { disposeCopy } from "./bookcopymodules/dispose.js";

const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);
let genres = [];
let categories = [];
let copies = [];
let authors = [];
let publishers = [];
let conditions = [];
let disposalreasons = [];
let allborrows = [];
let activeborrows = [];

document.getElementById('welcome').innerHTML = `Welcome Student Assistant ${sessionStorage.fullname}`;

const getAllBooks = async() => {
    const bookstablediv = document.getElementById('bookstablediv');

    const response = await axios.get(`${url}/books.php`,{
        params:{operation:"getAllBooks"}
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
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(book => { 
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
            row.querySelector(".update").addEventListener('click', () => {
                updateBook(book.book_id, authors, categories, genres, publishers, getAllBooks);
            })
            
            const deactivateBtn = row.querySelector(".deactivate");
            if(deactivateBtn){
                deactivateBtn.addEventListener('click', () => {
                    deactivateBook(book.book_id, getAllBooks);
                })
            }
            
            const reactivateBtn = row.querySelector(".reactivate");
            if(reactivateBtn){
                reactivateBtn.addEventListener('click', () => {
                    reactivateBook(book.book_id, getAllBooks);
                })
            }
        })
        table.appendChild(tbody);
        bookstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllCopies = async() => {
    const copiestablediv = document.getElementById('copiestablediv');

    const response = await axios.get(`${url}/bookcopies.php`,{
        params:{operation:"getAllCopies"}
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
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(copy => { 
            copies.push(copy);
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
                    <button class="btn btn-danger btn-sm dispose">Dispose</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewCopy(copy.copy_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateCopy(copy.copy_id, conditions, getAllCopies);
            })
            row.querySelector(".dispose").addEventListener('click', () => {
                disposeCopy(copy.copy_id, disposalreasons, 3, getAllCopies);
            })
        })
        table.appendChild(tbody);
        copiestablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllAuthors = async() => {
    const authorstablediv = document.getElementById('authorstablediv');

    const response = await axios.get(`${url}/authors.php`,{
        params:{operation:"getAllAuthors"}
    })

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Author ID</th>
            <th>Author Name</th>
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
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(author => { 
            authors.push(author);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.author_id}</td>
                <td>${author.author_name}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        authorstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllPublishers = async() => {
    const publisherstablediv = document.getElementById('publisherstablediv');

    const response = await axios.get(`${url}/publishers.php`,{
        params:{operation:"getAllPublishers"}
    })

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Publisher ID</th>
            <th>Publisher Name</th>
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
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(publisher => { 
            publishers.push(publisher);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${publisher.publisher_id}</td>
                <td>${publisher.publisher_name}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        publisherstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllGenres = async() => {
    const response = await axios.get(`${url}/genres.php`,{
        params:{operation:"getAllGenres"}
    })

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(genre => {
            genres.push(genre);
        })
    }
    else{
        alert("ERROR");
    }
}

const getAllCategories = async() => {
    const response = await axios.get(`${url}/categories.php`,{
        params:{operation:"getAllCategories"}
    })

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(category => {
            categories.push(category);
        })
    }
    else{
        alert("ERROR");
    }
}

const getAllConditions = async() => {
    const response = await axios.get(`${url}/conditions.php`,{
        params:{operation:"getAllConditions"}
    })

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(condition => {
            conditions.push(condition);
        })
    }
    else{
        alert("ERROR");
    }
}

const getAllDisposalReasons = async() => {
    const response = await axios.get(`${url}/disposalreasons.php`,{
        params:{operation: "getAllDisposalReasons"}
    })

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(reason => {
            disposalreasons.push(reason);
        })
    }
    else{
        alert("ERROR");
    }
}

const getAllBorrows = async() => {
    const borrowstablediv = document.getElementById('borrowstablediv');

    const response = await axios.get(`${url}/borrowtransactions.php`,{
        params:{operation:"getAllBorrowTransactions"}
    })

    borrowstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Accession Number</th>
            <th>Book Title</th>
            <th>Borrower</th>
            <th>Borrowed At</th>
            <th>Due Date</th>
            <th>Processed By</th>
            <th>Status</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);

        allborrows = response.data;
        activeborrows = allborrows.filter(item => item.is_returned == 0);

        response.data.forEach(transaction => { 
            let status;
            if(transaction.is_returned == 1){
                status = "Returned";
            }
            else{
                const now = new Date();
                const dueDate = new Date(transaction.expires_at);

                if(now > dueDate){
                    status = "Overdue";
                }
                else{
                    status = "Active";
                }
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.accession_number}</td>
                <td>${transaction.book_title}</td>
                <td>${transaction.borrower_first_name + " " + transaction.borrower_last_name}</td>
                <td>${transaction.borrowed_at}</td>
                <td>${transaction.expires_at}</td>
                <td>${transaction.processed_by_first_name + " " + transaction.processed_by_last_name}</td>
                <td>${status}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        borrowstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllReturns = async() => {
    const returnstablediv = document.getElementById('returnstablediv');

    const response = await axios.get(`${url}/returntransactions.php`,{
        params:{operation:"getAllReturnTransactions"}
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
        response.data.forEach(transaction => { 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.accession_number}</td>
                <td>${transaction.book_title}</td>
                <td>${transaction.borrower_first_name + " " + transaction.borrower_last_name}</td>
                <td>${transaction.expires_at}</td>
                <td>${transaction.returned_at}</td>
                <td>${transaction.condition_desc}</td>
                <td>${transaction.condition_notes}</td>
                <td>${transaction.received_by_first_name + " " + transaction.received_by_last_name}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        returnstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllRenewals = async() => {
    const renewalstablediv = document.getElementById('renewalstablediv');

    const response = await axios.get(`${url}/renewals.php`,{
        params:{operation:"getAllRenewals"}
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
        response.data.forEach(transaction => { 
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
    }
    else{
        alert("ERROR");
    }
}

const getAllFines = async() => {
    const finestablediv = document.getElementById('finestablediv');

    const response = await axios.get(`${url}/fines.php`,{
        params:{operation:"getAllFines"}
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
        response.data.forEach(fine => { 
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
                        getAllFines();
                        alert("Fine marked as paid");
                    }
                    else{
                        alert("Failed to update fine");
                    }
                })
            }
        })
        table.appendChild(tbody);
        finestablediv.appendChild(table);
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

document.addEventListener('DOMContentLoaded', () => {
    getAllBooks();
    getAllCopies();
    getAllAuthors();
    getAllPublishers();
    getAllGenres();
    getAllCategories();
    getAllConditions();
    getAllDisposalReasons();
    getAllBorrows();
    getAllReturns();
    getAllRenewals();
    getAllFines();
    document.getElementById('startborrow').addEventListener('click', () => {
        startBorrow(copies, getAllBorrows);
    })
    document.getElementById('startreturn').addEventListener('click', () => {
        startReturn(activeborrows, conditions, getAllBorrows, getAllReturns);
    })
    document.getElementById('startrenew').addEventListener('click', () => {
        startRenew(activeborrows, getAllBorrows, getAllRenewals);
    })
    document.getElementById('addbook').addEventListener('click', () => {
        addBook(authors, categories, genres, publishers, getAllBooks);
    })
    document.getElementById('addcopy').addEventListener('click', () => {
        addCopy(getAllCopies);
    })
})