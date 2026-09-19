export const viewStatus = async(status_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const status = await getStatus(status_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Status</td>
                <td>
                    ${status.status_desc}
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

const getStatus = async(status_id) => {
    const params = {
        operation: "getStatus",
        json: JSON.stringify({status_id: status_id})
    }

    const response = await axios.get(`${sessionStorage.url}/statuses.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}