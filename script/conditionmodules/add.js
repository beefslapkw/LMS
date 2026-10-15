export const addCondition = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Condition";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Condition</td>
                <td>
                    <input type="text" id="condition_desc" class="form-control" placeholder="ex: Good">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Condition</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addConditionDetails() == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Condition added successfully",
                icon: 'success'
            })
            myModal.hide();
        }
        else{
            Swal.fire({
                title: 'Failed',
                text: "Failed to add condition",
                icon: 'error'
            })
        }
    })

    myModal.show();
}

const addConditionDetails = async() => {
    const desc = document.getElementById('condition_desc').value;

    if(!desc){
        return;
    }

    const jsondata = {
        condition_desc: desc
    };

    const formData = new FormData();
    formData.append('operation', "addCondition");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/conditions.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}