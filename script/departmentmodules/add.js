export const addDepartment = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Department";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Department Name</td>
                <td>
                    <input type="text" id="department_name" class="form-control" placeholder="ex: College of Computer Studies">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Department</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addDepartmentDetails() == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Department added successfully",
                icon: 'success'
            })
            myModal.hide();
        }
        else{
            Swal.fire({
                title: 'Failed',
                text: "Failed to add department",
                icon: 'error'
            })
        }
    })

    myModal.show();
}

const addDepartmentDetails = async() => {
    const deptname = document.getElementById('department_name').value;
    
    if(!deptname){
        return;
    }

    const jsondata = {
        department_name: deptname
    };

    const formData = new FormData();
    formData.append('operation', "addDepartment");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/departments.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}