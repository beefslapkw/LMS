export const viewAuthor = async(author_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const author = await getAuthor(author_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Author Name</td>
                <td>
                    ${author.author_name}
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

const getAuthor = async(author_id) => {
    const params = {
        operation: "getAuthor",
        json: JSON.stringify({author_id: author_id})
    }

    const response = await axios.get(`${sessionStorage.url}/authors.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}