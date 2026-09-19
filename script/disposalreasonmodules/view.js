export const viewDisposalReason = async(reason_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const disposalreason = await getDisposalReason(reason_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Reason</td>
                <td>
                    ${disposalreason.reason_desc}
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

const getDisposalReason = async(reason_id) => {
    const params = {
        operation: "getDisposalReason",
        json: JSON.stringify({reason_id: reason_id})
    }

    const response = await axios.get(`${sessionStorage.url}/disposalreasons.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}