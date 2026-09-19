import { viewBook } from "./bookmodules/view.js";
import { updateBook } from "./bookmodules/update.js";
import { deactivateBook } from "./bookmodules/deactivate.js";
import { reactivateBook } from "./bookmodules/reactivate.js";
// import { updateDetails } from "./bookmodules/update.js";
// import { deactivateUser } from "./bookmodules/deactivate.js";
// import { reactivateUser } from "./bookmodules/reactivate.js";
import { viewCopy } from "./bookcopymodules/view.js";
import { addCopy } from "./bookcopymodules/add.js";


const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);
let genres = [];
let categories = [];
let authors = [];
let publishers = [];
let selectedauthors = [];

document.getElementById('welcome').innerHTML = `Welcome Student Assistant ${sessionStorage.fullname}`;

const buildGenreDropdown = (genres) => {
    let genreSelect = `<select id="genre" class="form-select">
    <option value="" selected disabled>Select Genre</option>
    `;
    genres.forEach(genre => {
        genreSelect+=`<option value="${genre.genre_id}">${genre.genre_name}</option>`;
    })
    
    genreSelect+=`</select>`;

    return genreSelect;
}

const buildCategoryDropdown = (categories) => {
    let categorySelect = `<select id="category" class="form-select">
    <option value="" selected disabled>Select Category</option>
    `;
    categories.forEach(category => {
        categorySelect+=`<option value="${category.category_id}">${category.category_type}</option>`;
    })
    
    categorySelect+=`</select>`;

    return categorySelect;
}

const buildAuthorDropdown = (authors) => {
    let authorSelect = `<select id="author" class="form-select">
    <option value="" selected disabled>Select an author to add</option>
    `;
    authors.forEach(author => {
        authorSelect+=`<option value="${author.author_id}">${author.author_name}</option>`;
    })
    
    authorSelect+=`</select>`;

    return authorSelect;
}

const renderSelectedAuthors = () => {
    const listDiv = document.getElementById('selectedauthorslist');
    listDiv.innerHTML = '';

    selectedauthors.forEach(author => {
        const item = document.createElement('div');
        item.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'border', 'rounded', 'px-2', 'py-1', 'mb-1');
        item.innerHTML = `
            <span>${author.author_name}</span>
            <button type="button" class="btn btn-sm btn-outline-danger remove">&times;</button>
        `;
        item.querySelector('.remove').addEventListener('click', () => {
            selectedauthors = selectedauthors.filter(a => a.author_id != author.author_id);
            renderSelectedAuthors();
        })
        listDiv.appendChild(item);
    })
}

const buildPublisherDropdown = (publishers) => {
    let publisherSelect = `<select id="publisher" class="form-select">
    <option value="" selected disabled>Select Publisher</option>
    `;
    publishers.forEach(publisher => {
        publisherSelect+=`<option value="${publisher.publisher_id}">${publisher.publisher_name}</option>`;
    })
    
    publisherSelect+=`</select>`;

    return publisherSelect;
}

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

const addBook = async() => {
    selectedauthors = [];

    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Book Details";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Book Title</td>
                <td>
                    <input type="text" id="book_title" class="form-control" placeholder="ex: Noli Me Tangere">
                </td>
            </tr>
            <tr>
                <td>Author/s</td>  
                <td>
                    ${buildAuthorDropdown(authors)}
                    <div id="selectedauthorslist" class="mt-2"></div>
                </td>
            </tr>
            <tr>
                <td>Category</td>  
                <td>
                    ${buildCategoryDropdown(categories)}
                </td>
            </tr>
            <tr>   
                <td>Genre</td>
                <td>
                    ${buildGenreDropdown(genres)}
                </td>
            </tr>
            <tr>
                <td>Publisher</td>
                <td>
                    ${buildPublisherDropdown(publishers)}
                </td>
            </tr>
            <tr>
                <td>Shelf Location</td>
                <td>
                    <input type="text" id="shelf_location" class="form-control" placeholder="ex: A1-01"> 
                </td>
            </tr>      
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    document.getElementById('author').addEventListener('change', (e) => {
        const authorId = e.target.value;
        const alreadyAdded = selectedauthors.some(a => a.author_id == authorId);
        if(!alreadyAdded){
            const author = authors.find(a => a.author_id == authorId);
            selectedauthors.push(author);
            renderSelectedAuthors();
        }
        e.target.value = ""; 
    })

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Book</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addBookDetails() == 1){
            getAllBooks();
            alert("Successfully added book details");
            myModal.hide();
        }
        else{
            alert("Failed to add book");
        }
    })

    myModal.show();
}

const addBookDetails = async() => {
    const book = {
        book_title: document.getElementById('book_title').value,
        category_id: document.getElementById('category').value,
        genre_id: document.getElementById('genre').value,
        publisher_id: document.getElementById('publisher').value,
        shelf_location: document.getElementById('shelf_location').value,
        added_by: `${sessionStorage.userId}`
    };

    const authorIds = selectedauthors.map(a => a.author_id);

    const jsonData = {book: book, authors: authorIds};

    const formData = new FormData();
    formData.append('operation', "addBook");
    formData.append('json', JSON.stringify(jsonData));

    const response = await axios({
        url: `${url}/books.php`,
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
    document.getElementById('addbook').addEventListener('click', () => {
        addBook();
    })
    document.getElementById('addcopy').addEventListener('click', () => {
        addCopy(getAllCopies);
    })
})