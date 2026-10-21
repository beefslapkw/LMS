export const reactivateStatus = async(status_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Confirm Action";

    const myHtml = `
        <p>Are you sure you want to reactivate this status?</p>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-success btn-sm w-100 confirm-reactivate">Yes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Cancel</button>
    `;

    modalFooter.querySelector(".confirm-reactivate").addEventListener('click', async() => {
        const result = await reactivateStatusDetails(status_id);

        if(result == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Successfully reactivated status",
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

const reactivateStatusDetails = async(status_id) => {
    const jsondata = {
        status_id: status_id,
    };

    const formData = new FormData();
    formData.append("operation", "reactivateStatus");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/statuses.php`,
        method: "POST",
        data: formData
    });

    return response.data;
};