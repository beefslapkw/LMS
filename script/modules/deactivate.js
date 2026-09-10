export const deactivateUser = async(user_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Confirm Action";

    const myHtml = `
        <p>Are you sure you want to deactivate this account?</p>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm w-100 confirm-deactivate">Yes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Cancel</button>
    `;

    modalFooter.querySelector(".confirm-deactivate").addEventListener('click', async() => {
        if(await deactivateUserDetails(user_id) == 1){
            refreshDisplay();
            alert("Successfully deactivated user");
            myModal.hide();
        }
        else{
            alert("Failed to deactivate user");
        }
    })

    myModal.show();
}

const deactivateUserDetails = async(user_id) => {
    const jsondata = {
        user_id: user_id,
    };

    const formData = new FormData();
    formData.append("operation", "deactivateUser");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/users.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}