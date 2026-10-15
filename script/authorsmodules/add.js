export const addAuthor= async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Author";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Author Name</td>
                <td>
                    <input type="text" id="author_name" class="form-control" placeholder="ex: Adormie Macario">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Author</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addAuthorDetails() == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Author added successfully",
                icon: 'success'
            })
            myModal.hide();
        }
        else{
            Swal.fire({
                title: 'Failed',
                text: "Failed to add author",
                icon: 'error'
            })
        }
    })

    myModal.show();
}

const addAuthorDetails = async() => {
    const name = document.getElementById('author_name').value

    if(!name){
        return;
    }

    const jsondata = {
        author_name: name
    };

    const formData = new FormData();
    formData.append('operation', "addAuthor");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/authors.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}
