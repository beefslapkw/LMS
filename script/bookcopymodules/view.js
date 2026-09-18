export const viewCopy = async(copy_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const copy = await getCopyDetails(copy_id);

    let condition;
    if(!copy.condition_notes){
        condition = "N/A";
    }
    else{
        condition = copy.condition_notes;
    }

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Book Title</td>
                <td>
                    ${copy.book_title}
                </td>
            </tr>
            <tr>
                <td>Accession Number</td>  
                <td>
                    ${copy.accession_number}
                <td>
            </tr>
            <tr>   
                <td>Condition</td>
                <td>
                    ${copy.condition_desc}
                </td>
            </tr>
            <tr>
                <td>Condition Notes</td>
                <td>
                    ${condition}
                </td>
            </tr>
            <tr>
                <td>Added By</td>
                <td>
                    ${copy.first_name + " " + copy.last_name}
                </td>
            </tr>      
            <tr>
                <td>Added At</td>
                <td>
                    ${copy.added_at}
                </td>
            </tr>
            <tr>
                <td>Status</td>
                <td>
                    ${copy.status_desc}
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

const getCopyDetails = async(copy_id) => {
    const params = {
        operation: "getCopy",
        json: JSON.stringify({copy_id: copy_id})
    }

    const response = await axios.get(`${sessionStorage.url}/bookcopies.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}