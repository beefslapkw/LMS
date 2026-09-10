export const reactivateUser = async(user_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Confirm Action";

    const myHtml = `
        <p>Are you sure you want to reactivate this account?</p>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-success btn-sm w-100 confirm-reactivate">Yes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Cancel</button>
    `;

    modalFooter.querySelector(".confirm-reactivate").addEventListener('click', async() => {
        const result = await reactivateUserDetails(user_id);

        if(result == 1){
            refreshDisplay();
            alert("Successfully reactivated user");
            myModal.hide();
        }
        else{
            alert(result);
        }
    })

    myModal.show();
}

const reactivateUserDetails = async(user_id) => {
    const jsondata = {
        user_id: user_id,
    };

    const formData = new FormData();
    formData.append("operation", "reactivateUser");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/users.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}