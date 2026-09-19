export const updateRole = async(role_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Role Details";
    const role = await getRole(role_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Role Name</td>  
                <td>
                    <input type="text" id="newrole" class="form-control" value="${role.role_type}"> 
                <td>
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
        if(await updateRoleDetails(role_id) == 1){
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

const getRole = async(role_id) => {
    const params = {
        operation: "getRole",
        json: JSON.stringify({role_id: role_id})
    }

    const response = await axios.get(`${sessionStorage.url}/roles.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updateRoleDetails = async(role_id) => {
    const jsondata = {
        role_id: role_id,
        role_type: document.getElementById('newrole').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateRole");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/roles.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}