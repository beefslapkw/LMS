import { addBook } from "./bookmodules/add.js";
import { viewBook } from "./bookmodules/view.js";
import { updateBook } from "./bookmodules/update.js";
import { deactivateBook } from "./bookmodules/deactivate.js";
import { reactivateBook } from "./bookmodules/reactivate.js";
// import { updateDetails } from "./bookmodules/update.js";
// import { deactivateUser } from "./bookmodules/deactivate.js";
// import { reactivateUser } from "./bookmodules/reactivate.js";
import { addCopy } from "./bookcopymodules/add.js";
import { viewCopy } from "./bookcopymodules/view.js";
import { updateCopy } from "./bookcopymodules/update.js";


const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);
let genres = [];
let categories = [];
let authors = [];
let publishers = [];
let conditions = [];

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
            row.querySelector(".update").addEventListener('click', () => {
                updateCopy(copy.copy_id, conditions, getAllCopies);
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

document.addEventListener('DOMContentLoaded', () => {
    getAllBooks();
    getAllCopies();
    getAllAuthors();
    getAllPublishers();
    getAllGenres();
    getAllCategories();
    getAllConditions();
    document.getElementById('addbook').addEventListener('click', () => {
        addBook(authors, categories, genres, publishers, getAllBooks);
    })
    document.getElementById('addcopy').addEventListener('click', () => {
        addCopy(getAllCopies);
    })
})