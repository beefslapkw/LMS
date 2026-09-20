let foundBorrowItem = null;

export const startRenew = async(allActiveBorrows, refreshBorrows, refreshRenewals) => {
    foundBorrowItem = null;

    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Renew a Book";

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Accession Number</td>
                <td>
                    <div class="input-group">
                        <input type="text" id="renewaccession" class="form-control" placeholder="ex: 1001">
                        <button type="button" class="btn btn-outline-secondary" id="findrenew">Find</button>
                    </div>
                    <div id="renewresult" class="form-text"></div>
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    document.getElementById('findrenew').addEventListener('click', () => {
        const accession = document.getElementById('renewaccession').value;

        foundBorrowItem = allActiveBorrows.find(b => b.accession_number == accession && b.is_returned == 0);

        const resultDiv = document.getElementById('renewresult');
        if(!foundBorrowItem){
            resultDiv.innerHTML = `<span class="text-danger">No active borrow found for this copy</span>`;
        }
        else{
            resultDiv.innerHTML = `<span class="text-success">Found: ${foundBorrowItem.book_title}, borrowed by ${foundBorrowItem.borrower_first_name} ${foundBorrowItem.borrower_last_name} (due ${foundBorrowItem.expires_at})</span>`;
        }
    })

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-success btn-sm w-100 confirm-renew">Confirm Renewal</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;

    modalFooter.querySelector(".confirm-renew").addEventListener('click', async() => {
        if(!foundBorrowItem){
            alert("Please find a valid active borrow first");
            return;
        }

        const result = await submitRenewal();
        if(result == 1){
            refreshBorrows();
            refreshRenewals();
            alert("Renewal successful");
            myModal.hide();
        }
        else{
            alert(result);
        }
    })

    myModal.show();
}

const submitRenewal = async() => {
    const jsondata = {
        borrow_item_id: foundBorrowItem.borrow_item_id,
        renewed_by: `${sessionStorage.userId}`
    };

    const formData = new FormData();
    formData.append('operation', "addRenewal");
    formData.append('json', JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/renewals.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}