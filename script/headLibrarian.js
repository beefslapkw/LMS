import { viewDetails } from "./modules/view.js";

const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);

document.getElementById('welcome').innerHTML = `Welcome Head Librarian ${sessionStorage.fullname}`;

const getAllUsers = async() => {
    const tablediv = document.getElementById('tablediv');
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
    const tbody = document.createElement('tbody');

    const response = await axios.get(`${url}/users.php`,{
        params:{operation:"getAllUsers"}
    })

    if(response.status == 200){
        console.log(response.data);
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
                    <button class="view">View</button>
                    <button class="update">Update</button>
                    <button class="deactivate">De-activate</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector(".view").addEventListener('click', () => {
                viewDetails(user.user_id);
            })
        })
        table.appendChild(tbody);
        tablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getAllUsers();
})