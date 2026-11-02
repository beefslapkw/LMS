export const viewReturnTransaction = async(return_transaction_id) => {
    document.getElementById("blank-modal-title").innerText = "Return Transaction Details";

    const transaction = await getReturnTransaction(return_transaction_id);

    let itemRows = '';
    transaction.items.forEach(item => {
        itemRows += `
            <tr>
                <td>${item.accession_number}</td>
                <td>${item.book_title}</td>
                <td>${item.expires_at}</td>
                <td>${item.condition_desc}</td>
                <td>${item.condition_notes ?? ''}</td>
            </tr>
        `;
    });

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Borrower</td>
                <td>
                    ${transaction.header.borrowers}
                </td>
            </tr>
            <tr>
                <td>Returned At</td>
                <td>
                    ${transaction.header.returned_at}
                </td>
            </tr>
            <tr>
                <td>Received By</td>
                <td>
                    ${transaction.header.received_by_first_name + " " + transaction.header.received_by_last_name}
                </td>
            </tr>
        </table>

        <table class="table table-sm table-striped">
            <thead>
                <tr>
                    <th>Accession Number</th>
                    <th>Book Title</th>
                    <th>Due Date</th>
                    <th>Condition on Return</th>
                    <th>Condition Notes</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
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

const getReturnTransaction = async(return_transaction_id) => {
    const params = {
        operation: "getReturnTransaction",
        json: JSON.stringify({return_transaction_id: return_transaction_id})
    }

    const response = await axios.get(`${sessionStorage.url}/returntransactions.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}