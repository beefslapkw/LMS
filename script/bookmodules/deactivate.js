export const deactivateBook = async(book_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Confirm Action";

    const myHtml = `
        <p>Are you sure you want to deactivate this book?</p>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    const modalFooter = document.getElementById("blank-modal-footer");
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm w-100 confirm-deactivate">Yes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Cancel</button>
    `;

    modalFooter.querySelector(".confirm-deactivate").addEventListener('click', async() => {
        const result = await deactivateBookDetails(book_id);

        if(result == 1){
            refreshDisplay();
            alert("Successfully deactivated book");
            myModal.hide();
        }
        else{
            alert(result);
        }
    })

    myModal.show();
}

const deactivateBookDetails = async(book_id) => {
    const jsondata = {
        book_id: book_id,
    };

    const formData = new FormData();
    formData.append("operation", "deactivateBook");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/books.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}