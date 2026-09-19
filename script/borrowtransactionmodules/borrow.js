let foundUser = null;
let selectedcopies = [];

export const startBorrow = async(allCopies, refreshDisplay) => {
    foundUser = null;
    selectedcopies = [];

    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Borrow Books";

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Borrower ID Number</td>
                <td>
                    <div class="input-group">
                        <input type="text" id="borroweridnum" class="form-control" placeholder="ex: 02-2223-00058">
                        <button type="button" class="btn btn-outline-secondary" id="finduser">Find</button>
                    </div>
                    <div id="userresult" class="form-text"></div>
                </td>
            </tr>
            <tr>
                <td>Accession Number</td>
                <td>
                    <div class="input-group">
                        <input type="text" id="copyaccession" class="form-control" placeholder="ex: 1001">
                        <button type="button" class="btn btn-outline-secondary" id="findcopy">Add</button>
                    </div>
                    <div id="copyresult" class="form-text"></div>
                    <div id="selectedcopieslist" class="mt-2"></div>
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    document.getElementById('finduser').addEventListener('click', async() => {
        const idnum = document.getElementById('borroweridnum').value;
        foundUser = await findUserByIdNumber(idnum);

        const resultDiv = document.getElementById('userresult');
        if(!foundUser){
            resultDiv.innerHTML = `<span class="text-danger">User not found</span>`;
        }
        else{
            let limit = 3; 
            if(foundUser.role_type == "Faculty"){
                limit = 10;
            }

            const activeCount = foundUser.active_borrow_count;
            resultDiv.innerHTML = `<span class="text-success">Found: ${foundUser.first_name} ${foundUser.last_name} (${activeCount}/${limit} borrowed)</span>`;
        }
    })

    document.getElementById('findcopy').addEventListener('click', () => {
        if(!foundUser){
            alert("Please find a borrower first");
            return;
        }

        let limit = 3;
        if(foundUser.role_type == "Faculty"){
            limit = 10;
        }

        if(foundUser.active_borrow_count + selectedcopies.length >= limit){
            alert("This borrower has reached their borrow limit");
            return;
        }

        const accession = document.getElementById('copyaccession').value;
        const copy = allCopies.find(c => c.accession_number == accession && c.status_desc == "Available");

        const resultDiv = document.getElementById('copyresult');

        if(!copy){
            resultDiv.innerHTML = `<span class="text-danger">Copy not found or unavailable</span>`;
            return;
        }

        const alreadyAdded = selectedcopies.some(c => c.copy_id == copy.copy_id);
        if(alreadyAdded){
            resultDiv.innerHTML = `<span class="text-danger">This copy is already in the list</span>`;
            return;
        }

        selectedcopies.push(copy);
        resultDiv.innerHTML = '';
        document.getElementById('copyaccession').value = "";
        renderSelectedCopies();
    })

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-success btn-sm w-100 confirm-borrow">Confirm Borrow</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;

    modalFooter.querySelector(".confirm-borrow").addEventListener('click', async() => {
        if(!foundUser){
            alert("Please find a valid borrower first");
            return;
        }
        if(selectedcopies.length == 0){
            alert("Please add at least one copy to borrow");
            return;
        }

        if(await submitBorrow() == 1){
            refreshDisplay();
            alert("Books successfully borrowed");
            myModal.hide();
        }
        else{
            alert("Failed to process borrow");
        }
    })

    myModal.show();
}

const renderSelectedCopies = () => {
    const listDiv = document.getElementById('selectedcopieslist');
    listDiv.innerHTML = '';

    selectedcopies.forEach(copy => {
        const item = document.createElement('div');
        item.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'border', 'rounded', 'px-2', 'py-1', 'mb-1');
        item.innerHTML = `
            <span>${copy.book_title} (${copy.accession_number})</span>
            <button type="button" class="btn btn-sm btn-outline-danger remove">&times;</button>
        `;
        item.querySelector('.remove').addEventListener('click', () => {
            selectedcopies = selectedcopies.filter(c => c.copy_id != copy.copy_id);
            renderSelectedCopies();
        })
        listDiv.appendChild(item);
    })
}

const findUserByIdNumber = async(idnum) => {
    const params = {
        operation: "getUserByIdNumber",
        json: JSON.stringify({id_number: idnum})
    }

    const response = await axios.get(`${sessionStorage.url}/users.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const submitBorrow = async() => {
    const jsondata = {
        header: {
            borrower_id: foundUser.user_id,
            processed_by: `${sessionStorage.userId}`
        },
        details: selectedcopies.map(c => ({ copy_id: c.copy_id }))
    };

    const formData = new FormData();
    formData.append('operation', "addBorrowTransaction");
    formData.append('json', JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/borrowtransactions.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}