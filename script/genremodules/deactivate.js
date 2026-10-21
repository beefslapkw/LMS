export const deactivateGenre = async(genre_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Confirm Action";

    const myHtml = `
        <p>Are you sure you want to deactivate this genre?</p>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm w-100 confirm-deactivate">Yes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Cancel</button>
    `;

    modalFooter.querySelector(".confirm-deactivate").addEventListener('click', async() => {
        const result = await deactivateGenreDetails(genre_id);

        if(result == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Successfully deactivated genre",
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

const deactivateGenreDetails = async(genre_id) => {
    const jsondata = {
        genre_id: genre_id,
    };

    const formData = new FormData();
    formData.append("operation", "deactivateGenre");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/genres.php`,
        method: "POST",
        data: formData
    });

    return response.data;
};