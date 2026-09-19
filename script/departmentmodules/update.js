export const updateDepartment = async(department_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Department Details";
    const department = await getDepartment(department_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Department Name</td>  
                <td>
                    <input type="text" id="newdepartment" class="form-control" value="${department.department_name}"> 
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
        if(await updateDepartmentDetails(department_id) == 1){
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

const getDepartment = async(department_id) => {
    const params = {
        operation: "getDepartment",
        json: JSON.stringify({department_id: department_id})
    }

    const response = await axios.get(`${sessionStorage.url}/departments.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updateDepartmentDetails = async(department_id) => {
    const jsondata = {
        department_id: department_id,
        department_name: document.getElementById('newdepartment').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateDepartment");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/departments.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}