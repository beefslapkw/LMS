export const addDisposalReason = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add DisposalReason";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Reason</td>
                <td>
                    <input type="text" id="reason_desc" class="form-control" placeholder="ex: Damaged beyond repair">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Disposal Reason</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addDisposalReasonDetails() == 1){
            refreshDisplay();
            alert("Successfully added disposalreason");
            myModal.hide();
        }
        else{
            alert("Failed to add disposalreason");
        }
    })

    myModal.show();
}

const addDisposalReasonDetails = async() => {
    const jsondata = {
        reason_desc: document.getElementById('reason_desc').value
    };

    const formData = new FormData();
    formData.append('operation', "addDisposalReason");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/disposalreasons.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}