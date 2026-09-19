export const disposeCopy = async(copy_id, reasons, disposedStatusId, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Dispose Copy";

    const copy = await getCopyDetails(copy_id);

    let condition;
    if(!copy.condition_notes){
        condition = "N/A";
    }
    else{
        condition = copy.condition_notes;
    }

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Book Title</td>
                <td>
                    ${copy.book_title}
                </td>
            </tr>
            <tr>
                <td>Accession Number</td>  
                <td>
                    ${copy.accession_number}
                <td>
            </tr>
            <tr>   
                <td>Condition</td>
                <td>
                    ${copy.condition_desc}
                </td>
            </tr>
            <tr>
                <td>Condition Notes</td>
                <td>
                    ${condition}
                </td>
            </tr>
            <tr>
                <td>Status</td>
                <td>
                    ${copy.status_desc}
                </td>
            </tr>
            <tr>
                <td>Disposal Reason</td>
                <td>
                    ${buildReasonDropdown(reasons)}
                </td>
            </tr>
            <tr>
                <td>Remarks</td>
                <td>
                    <input type="text" id="remarks" class="form-control" placeholder="ex: pages 40-60 water damaged">
                </td>
            </tr>
        </table>
    `;

    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm w-100 confirm-dispose">Confirm Disposal</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;

    modalFooter.querySelector(".confirm-dispose").addEventListener('click', async() => {
        const reasonId = document.getElementById('reason').value;

        if(!reasonId){
            alert("Please select a disposal reason");
            return;
        }

        if(await disposeCopyDetails(copy_id, disposedStatusId) == 1){
            refreshDisplay();
            alert("Copy successfully disposed");
            myModal.hide();
        }
        else{
            alert("Failed to dispose copy");
        }
    })

    myModal.show();
}

const getCopyDetails = async(copy_id) => {
    const params = {
        operation: "getCopy",
        json: JSON.stringify({copy_id: copy_id})
    }

    const response = await axios.get(`${sessionStorage.url}/bookcopies.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const disposeCopyDetails = async(copy_id, disposedStatusId) => {
    const jsondata = {
        copy_id: copy_id,
        status_id: disposedStatusId,
        reason_id: document.getElementById('reason').value,
        disposed_by: `${sessionStorage.userId}`,
        remarks: document.getElementById('remarks').value
    };

    const formData = new FormData();
    formData.append('operation', "disposeCopy");
    formData.append('json', JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/bookcopies.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}

const buildReasonDropdown = (reasons) => {
    let myHtml = `<select id="reason" class="form-select">
    <option value="" selected disabled>Select a reason</option>`;

    reasons.forEach(reason => {
        myHtml += `<option value="${reason.reason_id}">${reason.reason_desc}</option>`;
    })

    myHtml += `</select>`;

    return myHtml;
}