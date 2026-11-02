const borrowStatusBadges = {
    active:   '<span class="badge bg-success">Active</span>',
    overdue:  '<span class="badge bg-danger">Overdue</span>',
    returned: '<span class="badge bg-secondary">Returned</span>'
};

export const viewBorrowTransaction = async(transaction_id) => {
    document.getElementById("blank-modal-title").innerText = "Borrow Transaction Details";

    const transaction = await getBorrowTransaction(transaction_id);

    let itemRows = '';
    transaction.items.forEach(item => {
        itemRows += `
            <tr>
                <td>${item.accession_number}</td>
                <td>${item.book_title}</td>
                <td>${item.expires_at}</td>
                <td>${borrowStatusBadges[item.status]}</td>
            </tr>
        `;
    });

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Borrower</td>
                <td>
                    ${transaction.header.borrower_first_name + " " + transaction.header.borrower_last_name}
                </td>
            </tr>
            <tr>
                <td>Borrowed At</td>
                <td>
                    ${transaction.header.borrowed_at}
                </td>
            </tr>
            <tr>
                <td>Processed By</td>
                <td>
                    ${transaction.header.processed_by_first_name + " " + transaction.header.processed_by_last_name}
                </td>
            </tr>
        </table>

        <table class="table table-sm table-striped">
            <thead>
                <tr>
                    <th>Accession Number</th>
                    <th>Book Title</th>
                    <th>Due Date</th>
                    <th>Status</th>
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

const getBorrowTransaction = async(transaction_id) => {
    const params = {
        operation: "getBorrowTransaction",
        json: JSON.stringify({transaction_id: transaction_id})
    }

    const response = await axios.get(`${sessionStorage.url}/borrowtransactions.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}