export const viewRole = async(role_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const role = await getRole(role_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Role Name</td>
                <td>
                    ${role.role_type}
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