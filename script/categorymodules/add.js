export const addCategory = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Copy Details";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Category Name</td>
                <td>
                    <input type="text" id="category_type" class="form-control" placeholder="ex: Fictional">
                </td>
            </tr>
            <tr>
                <td>Borrow Duration (days)</td>
                <td>
                    <input type="number" id="borrow_duration" class="form-control">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Category</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addCategoryDetails() == 1){
            refreshDisplay();
            Swal.fire({
                title: 'Success',
                text: "Category added successfully",
                icon: 'success'
            })
            myModal.hide();
        }
        else{
            Swal.fire({
                title: 'Failed',
                text: "Failed to add category",
                icon: 'error'
            })
        }
    })

    myModal.show();
}

const addCategoryDetails = async() => {
    const categtype = document.getElementById('category_type').value;
    const borrowdur = Number(document.getElementById('borrow_duration').value); 
    
    if(!categtype || !borrowdur){
        return;
    }

    const jsondata = {
        category_type: categtype,
        borrow_duration: borrowdur
    };

    const formData = new FormData();
    formData.append('operation', "addCategory");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/categories.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}
