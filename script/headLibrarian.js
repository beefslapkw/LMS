import { viewDetails } from "./modules/view.js";
import { updateDetails } from "./modules/update.js";
import { deactivateUser } from "./modules/deactivate.js";
import { reactivateUser } from "./modules/reactivate.js";

const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);
let departments = [];
let roles = [];

document.getElementById('welcome').innerHTML = `Welcome Head Librarian ${sessionStorage.fullname}`;

const getAllDepartments = async() => {
    const response = await axios.get(`${url}/departments.php`,{
        params:{operation:"getAllDepartments"}
    })

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(department => {
            departments.push(department);
        })
    }
    else{
        alert("ERROR");
    }
}

const getAllRoles = async() => {
    const response = await axios.get(`${url}/roles.php`,{
        params:{operation:"getAllRoles"}
    })

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(role => {
            roles.push(role);
        })
    }
    else{
        alert("ERROR");
    }
}

const getAllUsers = async() => {
    const tablediv = document.getElementById('tablediv');

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
            Total User Count <br> <span style="font-weight: 800">${response.data.length}</span>
        `;
        response.data.forEach(user => { 
            let status;
            if(user.is_active == 1){
                status = "Active";
            }
            else if(user.is_active == 0){
                status = "Inactive";
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
                    <button class="btn btn-danger btn-sm deactivate">De-activate</button>
                    <button class="btn btn-primary btn-sm reactivate">Re-activate</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewDetails(user.user_id);
            })
            row.querySelector(".update").addEventListener('click', () => {
                updateDetails(user.user_id, departments, roles, getAllUsers);
            })
            row.querySelector(".deactivate").addEventListener('click', () => {
                deactivateUser(user.user_id, getAllUsers);
            })
            row.querySelector(".reactivate").addEventListener('click', () => {
                reactivateUser(user.user_id, getAllUsers);
            })
        })
        table.appendChild(tbody);
        tablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllBooks = async() => {
    const response = await axios.get(`${url}/books.php`,{
        params:{operation:"getAllBooks"}
    })

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('bookscard').innerHTML = `
            Total Books Quantity <br> <span style="font-weight: 800">${response.data.length}</span>
        `;
    }
}

const getAllAuthors = async() => {
    const response = await axios.get(`${url}/authors.php`,{
        params:{operation:"getAllAuthors"}
    })

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('authorscard').innerHTML = `
            Total Authors Quantity <br> <span style="font-weight: 800">${response.data.length}</span>
        `;
    }
}

const getAllCopies = async() => {
    const response = await axios.get(`${url}/bookcopies.php`,{
        params:{operation:"getAllCopies"}
    })

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('copiescard').innerHTML = `
            Total Book Copies Quantity <br> <span style="font-weight: 800">${response.data.length}</span>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getAllDepartments();
    getAllRoles();
    getAllUsers();
    getAllBooks();
    getAllAuthors();
    getAllCopies();
})