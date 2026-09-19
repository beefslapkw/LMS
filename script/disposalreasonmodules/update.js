export const updateDisposalReason = async(reason_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update DisposalReason Details";
    const disposalreason = await getDisposalReason(reason_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Reason</td>  
                <td>
                    <input type="text" id="newdisposalreason" class="form-control" value="${disposalreason.reason_desc}"> 
                <td>
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
        if(await updateDisposalReasonDetails(reason_id) == 1){
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

const updateDisposalReasonDetails = async(reason_id) => {
    const jsondata = {
        reason_id: reason_id,
        reason_desc: document.getElementById('newdisposalreason').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateDisposalReason");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/disposalreasons.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}