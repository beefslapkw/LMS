export const updateCategory = async(category_id, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Category Details";
    const category = await getCategory(category_id);

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Category Name</td>  
                <td>
                    <input type="text" id="newcategory" class="form-control" value="${category.category_type}"> 
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
        if(await updateCategoryDetails(category_id) == 1){
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

const getCategory = async(category_id) => {
    const params = {
        operation: "getCategory",
        json: JSON.stringify({category_id: category_id})
    }

    const response = await axios.get(`${sessionStorage.url}/categories.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}

const updateCategoryDetails = async(category_id) => {
    const jsondata = {
        category_id: category_id,
        category_type: document.getElementById('newcategory').value,
    };

    const formData = new FormData();
    formData.append("operation", "updateCategory");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/categories.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}