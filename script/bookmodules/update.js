export const updateDetails = async(user_id, departments, roles, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update User Details";
    const user = await getUser(user_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Role</td>
                <td>
                    ${createRoleSelect(roles, user.role_id)}
                </td>
            </tr>
            <tr>
                <td>ID Number</td>  
                <td>
                    <input type="text" id="newidnum" class="form-control" value="${user.id_number}"> 
                <td>
            </tr>
            <tr>   
                <td>Last Name</td>
                <td>
                    <input type="text" id="newlastn" class="form-control" value="${user.last_name}">
                </td>
            </tr>
            <tr>
                <td>First Name</td>
                <td>
                    <input type="text" id="newfirstn" class="form-control" value="${user.first_name}"> 
                </td>
            </tr>
            <tr>
                <td>Contact Number</td>
                <td>
                    <input type="text" id="newcontact" class="form-control" value="${user.contact_number}"> 
                </td>
            </tr>      
            <tr>
                <td>Email Address</td>
                <td>
                    <input type="email" id="newemail" class="form-control" value="${user.email_address}"> 
                </td>
            </tr>
            <tr>
                <td>Username</td>
                <td>
                    <input type="text" id="newusername" class="form-control" value="${user.username}"> 
                </td>
            </tr>
            <tr>
                <td>Password</td>
                <td>
                    <input type="text" id="newpassword" class="form-control" placeholder="Enter New Password"> 
                </td>
            </tr>
            <tr>
                <td>Department</td>
                <td>
                    ${createDepartmentSelect(departments, user.department_id)}
                </td>
            </tr> 
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 update">Save Changes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".update").addEventListener('click', async() => {
        if(await updateUserDetails(user_id) == 1){
            refreshDisplay();
            alert("Successfully saved changes");
            myModal.hide();
        }
        else{
            alert("Failed to save changes");
        }
    })

    myModal.show();
}

const getUser = async(user_id) => {
    const params = {
        operation: "getUser",
        json: JSON.stringify({user_id: user_id})
    }

    const response = await axios.get(`${sessionStorage.url}/users.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updateUserDetails = async(user_id) => {
    const password = document.getElementById('newpassword').value;
    const jsondata = {
        user_id: user_id,
        role_id: document.getElementById('newrole').value,
        id_number: document.getElementById('newidnum').value,
        last_name: document.getElementById('newlastn').value,
        first_name: document.getElementById('newfirstn').value,
        contact_number: document.getElementById('newcontact').value,
        email_address: document.getElementById('newemail').value,
        username: document.getElementById('newusername').value,
        department_id: document.getElementById('newdepartment').value
    };
    if(password.trim()!== ""){
        jsondata.password = password;
    }

    const formData = new FormData();
    formData.append("operation", "updateUser");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/users.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}

const createRoleSelect = (roles, roleId) => {
    let myHtml = `<select id="newrole" class="form-select">`;

    roles.forEach(role => {
        let selected = roleId == role.role_id ? "selected" : "";
        myHtml += `<option value="${role.role_id}" ${selected}>${role.role_type}</option>`;
    })

    myHtml+= "</select>";
    return myHtml;
}

const createDepartmentSelect = (departments, departmentId) => {
    let myHtml = `<select id="newdepartment" class="form-select">`;

    departments.forEach(department => {
        let selected = departmentId == department.department_id ? "selected" : "";
        myHtml += `<option value="${department.department_id}" ${selected}>${department.department_name}</option>`;
    })

    myHtml+= "</select>";
    return myHtml;
}