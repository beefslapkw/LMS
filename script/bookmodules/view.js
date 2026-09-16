export const viewDetails = async(user_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const user = await getUser(user_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Role</td>
                <td>
                    ${user.role_type}
                </td>
            </tr>
            <tr>
                <td>ID Number</td>  
                <td>
                    ${user.id_number}
                <td>
            </tr>
            <tr>   
                <td>Last Name</td>
                <td>
                    ${user.last_name}
                </td>
            </tr>
            <tr>
                <td>First Name</td>
                <td>
                    ${user.first_name}
                </td>
            </tr>
            <tr>
                <td>Contact Number</td>
                <td>
                    ${user.contact_number}
                </td>
            </tr>      
            <tr>
                <td>Email Address</td>
                <td>
                    ${user.email_address}
                </td>
            </tr>
            <tr>
                <td>Username</td>
                <td>
                    ${user.username}
                </td>
            </tr>
            <tr>
                <td>Department</td>
                <td>
                    ${user.department_name}
                </td>
            </tr> 
        </table>
    `;

    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer").innerHTML = `
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;

    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

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