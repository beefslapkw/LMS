import { viewDetails } from "./usermodules/view.js";
import { updateDetails } from "./usermodules/update.js";
import { deactivateUser } from "./usermodules/deactivate.js";
import { reactivateUser } from "./usermodules/reactivate.js";

import { viewBook } from "./bookmodules/view.js";

import { addCategory } from "./categorymodules/add.js";
import { viewCategory } from "./categorymodules/view.js";
import { updateCategory } from "./categorymodules/update.js";

import { addAuthor } from "./authorsmodules/add.js";
import { viewAuthor } from "./authorsmodules/view.js";
import { updateAuthor } from "./authorsmodules/update.js";

import { addPublisher } from "./publishermodules/add.js";
import { viewPublisher } from "./publishermodules/view.js";
import { updatePublisher } from "./publishermodules/update.js";

import { addGenre } from "./genremodules/add.js";
import { viewGenre } from "./genremodules/view.js";
import { updateGenre } from "./genremodules/update.js";

import { addDepartment } from "./departmentmodules/add.js";
import { viewDepartment } from "./departmentmodules/view.js";
import { updateDepartment } from "./departmentmodules/update.js";

import { addRole } from "./rolemodules/add.js";
import { viewRole } from "./rolemodules/view.js";
import { updateRole } from "./rolemodules/update.js";

import { addStatus } from "./statusmodules/add.js";
import { viewStatus } from "./statusmodules/view.js";
import { updateStatus } from "./statusmodules/update.js";

import { addCondition } from "./conditionmodules/add.js";
import { viewCondition } from "./conditionmodules/view.js";
import { updateCondition } from "./conditionmodules/update.js";

import { addDisposalReason } from "./disposalreasonmodules/add.js";
import { viewDisposalReason } from "./disposalreasonmodules/view.js";
import { updateDisposalReason } from "./disposalreasonmodules/update.js";

const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);
let departments = [];
let roles = [];
let genres = [];
let categories = [];

document.getElementById('welcome').innerHTML = `Welcome Head Librarian ${sessionStorage.fullname}`;

const getAllDepartments = async() => {
    const departmentstablediv = document.getElementById('departmentstablediv');

    const response = await axios.get(`${url}/departments.php`,{
        params:{operation:"getAllDepartments"}
    })

    departmentstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Department Name</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        departments = [];
        response.data.forEach(department => {
            departments.push(department);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${department.department_name}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewDepartment(department.department_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateDepartment(department.department_id, getAllDepartments);
            })
        })
        table.appendChild(tbody);
        departmentstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllRoles = async() => {
    const rolestablediv = document.getElementById('rolestablediv');

    const response = await axios.get(`${url}/roles.php`,{
        params:{operation:"getAllRoles"}
    })

    rolestablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Role Name</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        roles = [];
        response.data.forEach(role => {
            roles.push(role);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${role.role_type}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewRole(role.role_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateRole(role.role_id, getAllRoles);
            })
        })
        table.appendChild(tbody);
        rolestablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllStatuses = async() => {
    const statusestablediv = document.getElementById('statusestablediv');

    const response = await axios.get(`${url}/statuses.php`,{
        params:{operation:"getAllStatuses"}
    })

    statusestablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Status</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(status => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${status.status_desc}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewStatus(status.status_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateStatus(status.status_id, getAllStatuses);
            })
        })
        table.appendChild(tbody);
        statusestablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllConditions = async() => {
    const conditionstablediv = document.getElementById('conditionstablediv');

    const response = await axios.get(`${url}/conditions.php`,{
        params:{operation:"getAllConditions"}
    })

    conditionstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Condition</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(condition => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${condition.condition_desc}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewCondition(condition.condition_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateCondition(condition.condition_id, getAllConditions);
            })
        })
        table.appendChild(tbody);
        conditionstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllDisposalReasons = async() => {
    const disposalreasonstablediv = document.getElementById('disposalreasonstablediv');

    const response = await axios.get(`${url}/disposalreasons.php`,{
        params:{operation:"getAllDisposalReasons"}
    })

    disposalreasonstablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Reason</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(reason => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${reason.reason_desc}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewDisposalReason(reason.reason_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateDisposalReason(reason.reason_id, getAllDisposalReasons);
            })
        })
        table.appendChild(tbody);
        disposalreasonstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllUsers = async() => {
    const tablediv = document.getElementById('userstablediv');

    tablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>ID Number</th>
            <th>Last Name</th>
            <th>First Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    const response = await axios.get(`${url}/users.php`,{
        params:{operation:"getAllUsers"}
    })

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('userscard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #ff6600;">
                <small class="text-uppercase fw-semibold">Total User Count</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(user => { 
            let status;
            let statusButtons;
            if(user.is_active == 1){
                status = "Active";
                statusButtons = `<button class="btn btn-danger btn-sm deactivate">De-activate</button>`;
            }
            else if(user.is_active == 0){
                status = "Inactive";
                statusButtons = `<button class="btn btn-primary btn-sm reactivate">Re-activate</button>`;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id_number}</td>
                <td>${user.last_name}</td>
                <td>${user.first_name}</td>
                <td>${user.username}</td>
                <td>${user.role_type}</td>
                <td>${user.department_name}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                    ${statusButtons}
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewDetails(user.user_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateDetails(user.user_id, departments, roles, getAllUsers);
            })

            const deactivateBtn = row.querySelector(".deactivate");
            if(deactivateBtn){
                deactivateBtn.addEventListener('click', () => {
                    deactivateUser(user.user_id, getAllUsers);
                })
            }

            const reactivateBtn = row.querySelector(".reactivate");
            if(reactivateBtn){
                reactivateBtn.addEventListener('click', () => {
                    reactivateUser(user.user_id, getAllUsers);
                })
            }
        })
        table.appendChild(tbody);
        tablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllBooks = async() => {
    const bookstablediv = document.getElementById('bookstablediv');

    const response = await axios.get(`${url}/books.php`,{
        params:{operation:"getAllBooks"}
    })

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
                updateDetails(book.book_id, departments, roles, getAllUsers);
            })
            
            const deactivateBtn = row.querySelector(".deactivate");
            if(deactivateBtn){
                deactivateBtn.addEventListener('click', () => {
                    deactivateUser(user.user_id, getAllUsers);
                })
            }
            
            const reactivateBtn = row.querySelector(".reactivate");
            if(reactivateBtn){
                reactivateBtn.addEventListener('click', () => {
                    reactivateUser(user.user_id, getAllUsers);
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
            `;
            tbody.appendChild(row);
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

    authorstablediv.innerHTML = "";

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Author ID</th>
            <th>Author Name</th>
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
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(author => { 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.author_id}</td>
                <td>${author.author_name}</td>
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
                updateAuthor(author.author_id, getAllAuthors);
            })
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
        response.data.forEach(publisher => { 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${publisher.publisher_id}</td>
                <td>${publisher.publisher_name}</td>
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
                updatePublisher(publisher.publisher_id, getAllPublishers);
            })
        })
        table.appendChild(tbody);
        publisherstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllGenres = async() => {
    const genrestablediv = document.getElementById('genrestablediv');

    const response = await axios.get(`${url}/genres.php`,{
        params:{operation:"getAllGenres"}
    })

    genrestablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Genre Name</th>
            <th>Action</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        genres = [];
        response.data.forEach(genre => {
            genres.push(genre);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${genre.genre_name}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewGenre(genre.genre_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateGenre(genre.genre_id, getAllGenres);
            })
        })
        table.appendChild(tbody);
        genrestablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllCategories = async() => {
    const categoriestablediv = document.getElementById('categoriestablediv');

    const response = await axios.get(`${url}/categories.php`,{
        params:{operation:"getAllCategories"}
    })

    categoriestablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
    <tr>
        <th>Category Type</th>
        <th>Action</th>
    </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data); 
        response.data.forEach(category => {
            categories.push(category);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.category_type}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewCategory(category.category_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateCategory(category.category_id, getAllCategories);
            })
        })
        table.appendChild(tbody);
        categoriestablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getAllDepartments();
    getAllRoles();
    getAllUsers();
    getAllBooks();
    getAllCopies();
    getAllAuthors();
    getAllPublishers();
    getAllGenres();
    getAllCategories();
    getAllStatuses();
    getAllConditions();
    getAllDisposalReasons();

    document.getElementById('addcategory').addEventListener('click', () => {
        addCategory(getAllCategories);
    })
    document.getElementById('addauthor').addEventListener('click', () => {
        addAuthor(getAllAuthors);
    }) 
    document.getElementById('addpublisher').addEventListener('click', () => {
        addPublisher(getAllPublishers);
    })
    document.getElementById('addgenre').addEventListener('click', () => {
        addGenre(getAllGenres);
    })
    document.getElementById('adddepartment').addEventListener('click', () => {
        addDepartment(getAllDepartments);
    })
    document.getElementById('addrole').addEventListener('click', () => {
        addRole(getAllRoles);
    })
    document.getElementById('addstatus').addEventListener('click', () => {
        addStatus(getAllStatuses);
    })
    document.getElementById('addcondition').addEventListener('click', () => {
        addCondition(getAllConditions);
    })
    document.getElementById('adddisposalreason').addEventListener('click', () => {
        addDisposalReason(getAllDisposalReasons);
    })
})