export const updateGenre = async(genre_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Genre Details";
    const genre = await getGenre(genre_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Genre Name</td>  
                <td>
                    <input type="text" id="newgenre" class="form-control" value="${genre.genre_name}"> 
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
        if(await updateGenreDetails(genre_id) == 1){
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

const getGenre = async(genre_id) => {
    const params = {
        operation: "getGenre",
        json: JSON.stringify({genre_id: genre_id})
    }

    const response = await axios.get(`${sessionStorage.url}/genres.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updateGenreDetails = async(genre_id) => {
    const jsondata = {
        genre_id: genre_id,
        genre_name: document.getElementById('newgenre').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateGenre");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/genres.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}