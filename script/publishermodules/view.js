export const viewPublisher = async(publisher_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const publisher = await getPublisher(publisher_id);

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Publisher Name</td>
                <td>
                    ${publisher.publisher_name}
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

const getPublisher = async(publisher_id) => {
    const params = {
        operation: "getPublisher",
        json: JSON.stringify({publisher_id: publisher_id})
    }

    const response = await axios.get(`${sessionStorage.url}/publishers.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}