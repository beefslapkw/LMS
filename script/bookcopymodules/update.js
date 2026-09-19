export const updateCopy = async(copy_id, conditions, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "View Details";

    const copy = await getCopyDetails(copy_id);

    let condition;
    if(!copy.condition_notes){
        condition = "";
    }
    else{
        condition = copy.condition_notes;
    }

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Book Title</td>
                <td>
                    <input type="text" id="booktitle" class="form-control" value="${copy.book_title}" disabled> 
                </td>
            </tr>
            <tr>
                <td>Accession Number</td>  
                <td>
                    <input type="text" id="acsnumber" class="form-control" value="${copy.accession_number}" disabled> 
                <td>
            </tr>
            <tr>   
                <td>Condition</td>
                <td>
                    ${buildConditionsDropdown(conditions, copy.condition_id)}
                </td>
            </tr>
            <tr>
                <td>Condition Notes</td>
                <td>
                    <input type="text" id="nconditionNotes" class="form-control" value="${condition}"> 
                </td>
            </tr>
        </table>
    `;

    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 update">Save Changes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".update").addEventListener('click', async() => {
        if(await updateCopyDetails(copy_id) == 1){
            refreshDisplay();
            alert("Successfully saved changes");
            myModal.hide();
        }
        else{
            alert("Failed to save changes");
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

const updateCopyDetails = async(copy_id) => {
    const jsondata = {
        copy_id: copy_id,
        condition_id: document.getElementById('ncondition').value,
        condition_notes: document.getElementById('nconditionNotes').value
    }

    const formData = new FormData();
    formData.append("operation", "updateCopy");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/bookcopies.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}

const buildConditionsDropdown = (conditions, condition_id) => {
    let myHtml = `<select id="ncondition" class="form-select">`;

    conditions.forEach(condition => {
        let selected = condition_id == condition.condition_id ? "selected" : "";
        myHtml+=`<option value="${condition.condition_id}" ${selected}>${condition.condition_desc}</option>`;
    })

    myHtml+=`</select>`;

    return myHtml;
}