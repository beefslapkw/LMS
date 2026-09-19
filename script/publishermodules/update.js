export const updatePublisher = async(publisher_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Publisher Details";
    const publisher = await getPublisher(publisher_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Publisher Name</td>  
                <td>
                    <input type="text" id="newpublisher" class="form-control" value="${publisher.publisher_name}"> 
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
        if(await updatePublisherDetails(publisher_id) == 1){
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

const getPublisher = async(publisher_id) => {
    const params = {
        operation: "getPublisher",
        json: JSON.stringify({publisher_id: publisher_id})
    }

    const response = await axios.get(`${sessionStorage.url}/publishers.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updatePublisherDetails = async(publisher_id) => {
    const jsondata = {
        publisher_id: publisher_id,
        publisher_name: document.getElementById('newpublisher').value,
    };

    const formData = new FormData();
    formData.append("operation", "updatePublisher");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/publishers.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}