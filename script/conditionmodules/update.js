export const updateCondition = async(condition_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Condition Details";
    const condition = await getCondition(condition_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Condition</td>  
                <td>
                    <input type="text" id="newcondition" class="form-control" value="${condition.condition_desc}"> 
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
        if(await updateConditionDetails(condition_id) == 1){
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

const getCondition = async(condition_id) => {
    const params = {
        operation: "getCondition",
        json: JSON.stringify({condition_id: condition_id})
    }

    const response = await axios.get(`${sessionStorage.url}/conditions.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updateConditionDetails = async(condition_id) => {
    const jsondata = {
        condition_id: condition_id,
        condition_desc: document.getElementById('newcondition').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateCondition");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/conditions.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}