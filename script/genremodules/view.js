export const viewGenre = async(genre_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const genre = await getGenre(genre_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Genre Name</td>
                <td>
                    ${genre.genre_name}
                </td>
            </tr>
        </table>
    `;

    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer").innerHTML = `
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;

    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

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