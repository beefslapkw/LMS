export const viewDetails = async(user_id) => {
    const displaydiv = document.getElementById('display');
    const user = await getUser(user_id);

    displaydiv.innerHTML = `
        <h3>User Details</h3>
        <label>Role:</label>
        <input type="text" id="newrole" placeholder="${user.role_type}" disabled> <br>
        <label>ID Number:</label>
        <input type="text" id="newidnum" placeholder="${user.id_number}" disabled> <br>
        <label>Last Name:</label>
        <input type="text" id="newlastn" placeholder="${user.last_name}" disabled> <br>
        <label>First Name:</label>
        <input type="text" id="newfirstn" placeholder="${user.first_name}" disabled> <br>
        <label>Contact Number:</label>
        <input type="text" id="newcontact" placeholder="${user.contact_number}" disabled> <br>
        <label>Email Address:</label>
        <input type="email" id="newemail" placeholder="${user.email_address}" disabled> <br>
        <label>Username:</label>
        <input type="text" id="newusername" placeholder="${user.username}" disabled> <br>
        <label>Department:</label>
        <input type="text" id="newdepartment" placeholder="${user.department_name}" disabled> <br>
    `;
    displaydiv.style.display = "block";
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