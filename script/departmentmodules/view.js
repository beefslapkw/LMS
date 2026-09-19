export const viewDepartment = async(department_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const department = await getDepartment(department_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Department Name</td>
                <td>
                    ${department.department_name}
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