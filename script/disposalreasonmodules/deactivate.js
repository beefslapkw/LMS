export const deactivateDisposalReason = async(reason_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Confirm Action";

    const myHtml = `
        <p>Are you sure you want to deactivate this disposal reason?</p>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm w-100 confirm-deactivate">Yes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Cancel</button>
    `;

    modalFooter.querySelector(".confirm-deactivate").addEventListener('click', async() => {
        const result = await deactivateDisposalReasonDetails(reason_id);

        if(result == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Successfully deactivated disposal reason",
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

const deactivateDisposalReasonDetails = async(reason_id) => {
    const jsondata = {
        reason_id: reason_id,
    };

    const formData = new FormData();
    formData.append("operation", "deactivateDisposalReason");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/disposalreasons.php`,
        method: "POST",
        data: formData
    });

    return response.data;
};