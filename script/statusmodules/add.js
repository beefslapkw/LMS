export const addStatus = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Status";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Status</td>
                <td>
                    <input type="text" id="status_desc" class="form-control" placeholder="ex: Available">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Status</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addStatusDetails() == 1){
            refreshDisplay();
            alert("Successfully added status");
            myModal.hide();
        }
        else{
            alert("Failed to add status");
        }
    })

    myModal.show();
}

const addStatusDetails = async() => {
    const jsondata = {
        status_desc: document.getElementById('status_desc').value
    };

    const formData = new FormData();
    formData.append('operation', "addStatus");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/statuses.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}