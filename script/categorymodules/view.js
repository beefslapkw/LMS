export const viewCategory = async(category_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const category = await getCategory(category_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Category Type</td>
                <td>
                    ${category.category_type}
                </td>
            </tr>
            <tr>
                <td>Borrow Duration</td>
                <td>
                    ${category.borrow_duration + " days"}
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