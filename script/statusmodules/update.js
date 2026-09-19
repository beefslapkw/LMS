export const updateStatus = async(status_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Status Details";
    const status = await getStatus(status_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Status</td>  
                <td>
                    <input type="text" id="newstatus" class="form-control" value="${status.status_desc}"> 
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
        if(await updateStatusDetails(status_id) == 1){
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

const getStatus = async(status_id) => {
    const params = {
        operation: "getStatus",
        json: JSON.stringify({status_id: status_id})
    }

    const response = await axios.get(`${sessionStorage.url}/statuses.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updateStatusDetails = async(status_id) => {
    const jsondata = {
        status_id: status_id,
        status_desc: document.getElementById('newstatus').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateStatus");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/statuses.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}