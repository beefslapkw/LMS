export const addPublisher = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Copy Details";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Publisher Name</td>
                <td>
                    <input type="text" id="publisher_name" class="form-control" placeholder="ex: National Bookstore">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Publisher</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addPublisherDetails() == 1){
            refreshDisplay();
            alert("Successfully added publisher");
            myModal.hide();
        }
        else{
            alert("Failed to add publisher");
        }
    })

    myModal.show();
}

const addPublisherDetails = async() => {
    const jsondata = {
        publisher_name: document.getElementById('publisher_name').value
    };

    const formData = new FormData();
    formData.append('operation', "addpublisher");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/publishers.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}
