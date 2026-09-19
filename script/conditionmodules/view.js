export const viewCondition = async(condition_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const condition = await getCondition(condition_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Condition</td>
                <td>
                    ${condition.condition_desc}
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

const getCondition = async(condition_id) => {
    const params = {
        operation: "getCondition",
        json: JSON.stringify({condition_id: condition_id})
    }

    const response = await axios.get(`${sessionStorage.url}/conditions.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}