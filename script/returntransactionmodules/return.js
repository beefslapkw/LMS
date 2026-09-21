let selectedreturns = [];

export const startReturn = async(allActiveBorrows, conditions, refreshBorrows, refreshReturns, refreshFines) => {
    selectedreturns = [];

    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Return Books";

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Accession Number</td>
                <td>
                    <div class="input-group">
                        <input type="text" id="returnaccession" class="form-control" placeholder="ex: 1001">
                        <button type="button" class="btn btn-outline-secondary" id="findreturn">Add</button>
                    </div>
                    <div id="returnresult" class="form-text"></div>
                    <div id="selectedreturnslist" class="mt-2"></div>
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    document.getElementById('findreturn').addEventListener('click', () => {
        const accession = document.getElementById('returnaccession').value;

        const borrow = allActiveBorrows.find(b => b.accession_number == accession && b.is_returned == 0);

        const resultDiv = document.getElementById('returnresult');

        if(!borrow){
            resultDiv.innerHTML = `<span class="text-danger">No active borrow found for this copy</span>`;
            return;
        }

        const alreadyAdded = selectedreturns.some(r => r.borrow_item_id == borrow.borrow_item_id);
        if(alreadyAdded){
            resultDiv.innerHTML = `<span class="text-danger">This item is already in the list</span>`;
            return;
        }

        selectedreturns.push({
            borrow_item_id: borrow.borrow_item_id,
            book_title: borrow.book_title,
            accession_number: borrow.accession_number,
            borrower_name: `${borrow.borrower_first_name} ${borrow.borrower_last_name}`,
            expires_at: borrow.expires_at,
            condition_on_return: "",
            condition_notes: ""
        });

        resultDiv.innerHTML = '';
        document.getElementById('returnaccession').value = "";
        renderSelectedReturns(conditions);
    })

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-success btn-sm w-100 confirm-return">Confirm Return</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;

    modalFooter.querySelector(".confirm-return").addEventListener('click', async() => {
        if(selectedreturns.length == 0){
            alert("Please add at least one item to return");
            return;
        }

        const missingCondition = selectedreturns.some(r => !r.condition_on_return);
        if(missingCondition){
            alert("Please select a condition for every item");
            return;
        }

        if(await submitReturn() == 1){
            refreshBorrows();
            refreshReturns();
            refreshFines();
            alert("Books successfully returned");
            myModal.hide();
        }
        else{
            alert("Failed to process return");
        }
    })

    myModal.show();
}

const renderSelectedReturns = (conditions) => {
    const listDiv = document.getElementById('selectedreturnslist');
    listDiv.innerHTML = '';

    selectedreturns.forEach((item, index) => {
        const now = new Date();
        const dueDate = new Date(item.expires_at);
        let statusLabel = "On Time";
        if(now > dueDate){
            statusLabel = "Overdue";
        }

        const card = document.createElement('div');
        card.classList.add('border', 'rounded', 'p-2', 'mb-2');
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${item.book_title} (${item.accession_number}) — ${item.borrower_name} — <strong>${statusLabel}</strong></span>
                <button type="button" class="btn btn-sm btn-outline-danger remove">&times;</button>
            </div>
            <div class="mt-2">
                ${buildConditionsDropdown(conditions, index)}
                <input type="text" class="form-control form-control-sm mt-1 notesinput" data-index="${index}" placeholder="Condition notes (optional)">
            </div>
        `;

        card.querySelector('.remove').addEventListener('click', () => {
            selectedreturns = selectedreturns.filter(r => r.borrow_item_id != item.borrow_item_id);
            renderSelectedReturns(conditions);
        })

        card.querySelector('.conditionselect').addEventListener('change', (e) => {
            selectedreturns[index].condition_on_return = e.target.value;
        })

        card.querySelector('.notesinput').addEventListener('input', (e) => {
            selectedreturns[index].condition_notes = e.target.value;
        })

        listDiv.appendChild(card);
    })
}

const buildConditionsDropdown = (conditions, index) => {
    let myHtml = `<select class="form-select form-select-sm conditionselect" data-index="${index}">
    <option value="" selected disabled>Select condition on return</option>`;

    conditions.forEach(condition => {
        myHtml += `<option value="${condition.condition_id}">${condition.condition_desc}</option>`;
    })

    myHtml += `</select>`;

    return myHtml;
}

const submitReturn = async() => {
    const jsondata = {
        header: {
            received_by: `${sessionStorage.userId}`
        },
        details: selectedreturns.map(r => ({
            borrow_item_id: r.borrow_item_id,
            condition_on_return: r.condition_on_return,
            condition_notes: r.condition_notes
        }))
    };

    const formData = new FormData();
    formData.append('operation', "addReturnTransaction");
    formData.append('json', JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/returntransactions.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}