export const updateAuthor = async(author_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Author Details";
    const author = await getAuthor(author_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Author Name</td>  
                <td>
                    <input type="text" id="newauthor" class="form-control" value="${author.author_name}"> 
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
        if(await updateAuthorDetails(author_id) == 1){
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

const updateAuthorDetails = async(author_id) => {
    const jsondata = {
        author_id: author_id,
        author_name: document.getElementById('newauthor').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateAuthor");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/authors.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}