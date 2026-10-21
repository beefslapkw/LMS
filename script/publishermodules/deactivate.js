export const deactivatePublisher = async(publisher_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Confirm Action";

    const myHtml = `
        <p>Are you sure you want to deactivate this publisher?</p>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm w-100 confirm-deactivate">Yes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Cancel</button>
    `;

    modalFooter.querySelector(".confirm-deactivate").addEventListener('click', async() => {
        const result = await deactivatePublisherDetails(publisher_id);

        if(result == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Successfully deactivated publisher",
                icon: 'success'
            });
            myModal.hide();
        }
        else{
            Swal.fire({
                title: 'Failed',
                text: result,
                icon: 'error'
            });
        }
    });

    myModal.show();
};

const deactivatePublisherDetails = async(publisher_id) => {
    const jsondata = {
        publisher_id: publisher_id,
    };

    const formData = new FormData();
    formData.append("operation", "deactivatePublisher");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/publishers.php`,
        method: "POST",
        data: formData
    });

    return response.data;
};