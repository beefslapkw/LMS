export const addGenre = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Genre";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Genre Name</td>
                <td>
                    <input type="text" id="genre_name" class="form-control" placeholder="ex: Mystery">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Genre</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addGenreDetails() == 1){
            refreshDisplay();
            alert("Successfully added genre");
            myModal.hide();
        }
        else{
            alert("Failed to add genre");
        }
    })

    myModal.show();
}

const addGenreDetails = async() => {
    const jsondata = {
        genre_name: document.getElementById('genre_name').value
    };

    const formData = new FormData();
    formData.append('operation', "addGenre");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/genres.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}