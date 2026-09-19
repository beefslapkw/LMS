export const addRole = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Role";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Role Name</td>
                <td>
                    <input type="text" id="role_type" class="form-control" placeholder="ex: Student Assistant">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Role</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addRoleDetails() == 1){
            refreshDisplay();
            alert("Successfully added role");
            myModal.hide();
        }
        else{
            alert("Failed to add role");
        }
    })

    myModal.show();
}

const addRoleDetails = async() => {
    const jsondata = {
        role_type: document.getElementById('role_type').value
    };

    const formData = new FormData();
    formData.append('operation', "addRole");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/roles.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}