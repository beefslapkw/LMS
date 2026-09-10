export const updateDetails = async(user_id, departments, roles, refreshDisplay) => {
    const displaydiv = document.getElementById('display');
    const user = await getUser(user_id);

    displaydiv.innerHTML = `
        <h3>Update Menu</h3>
        <label>Role:</label>
        ${createRoleSelect(roles, user.role_id)} <br>
        <label>ID Number:</label>
        <input type="text" id="newidnum" value="${user.id_number}"> <br>
        <label>Last Name:</label>
        <input type="text" id="newlastn" value="${user.last_name}"> <br>
        <label>First Name:</label>
        <input type="text" id="newfirstn" value="${user.first_name}"> <br>
        <label>Contact Number:</label>
        <input type="text" id="newcontact" value="${user.contact_number}"> <br>
        <label>Email Address:</label>
        <input type="email" id="newemail" value="${user.email_address}"> <br>
        <label>Username:</label>
        <input type="text" id="newusername" value="${user.username}"> <br>
        <label>Password:</label>
        <input type="password" id="newpassword" placeholder="Enter New Password"> <br>
        <label>Department:</label>
        ${createDepartmentSelect(departments, user.department_id)} <br>
        <button id="save">Save Changes</button>
    `;
    displaydiv.style.display = "block";

    document.getElementById('save').addEventListener('click', async() => {
        if(await updateUserDetails(user_id) == 1){
            alert("Successfully saved changes");
            refreshDisplay();
        }
        else{
            alert("Failed to save changes");
        }
    })
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
    let myHtml = `<select id="newrole">`;

    roles.forEach(role => {
        let selected = roleId == role.role_id ? "selected" : "";
        myHtml += `<option value="${role.role_id}" ${selected}>${role.role_type}</option>`;
    })

    myHtml+= "</select>";
    return myHtml;
}

const createDepartmentSelect = (departments, departmentId) => {
    let myHtml = `<select id="newdepartment">`;

    departments.forEach(department => {
        let selected = departmentId == department.department_id ? "selected" : "";
        myHtml += `<option value="${department.department_id}" ${selected}>${department.department_name}</option>`;
    })

    myHtml+= "</select>";
    return myHtml;
}