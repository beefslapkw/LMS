export const addCopy = async(refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Copy Details";

    let myHtml = `
        <table class="table table-sm">
            <tr>   
                <td>Book Title</td>
                <td>
                    ${await getAllBooks()}
                </td>
            </tr>
            <tr>
                <td>Amount of Copies</td>
                <td>
                    <input type="number" id="qty" class="form-control">
                </td>
            </tr>
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Copies</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addCopyDetails() > 0){
            refreshDisplay();
            alert("Successfully added book copies");
            myModal.hide();
        }
        else{
            alert("Failed to add copy/s");
        }
    })

    myModal.show();
}

const getAllBooks = async() => {
    const response = await axios.get(`${sessionStorage.url}/books.php`,{
        params:{operation: "getAllBooks"}
    })

    let myHtml = `<select id="book" class="form-select">
    <option value="" selected disabled>Select Book</option>
    `;

    console.log(response.data);
    response.data.forEach(book => {
        myHtml+=`<option value="${book.book_id}">${book.book_title}</option>`;
    })

    myHtml+=`</select>`;

    return myHtml;
}

const addCopyDetails = async() => {
    const jsondata = {
        book_id: document.getElementById('book').value,
        qty: Number(document.getElementById('qty').value),
        added_by: `${sessionStorage.userId}`
    };

    const formData = new FormData();
    formData.append('operation', "addCopy");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/bookcopies.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}

// const getAllConditions = async() => {
//     const response = await axios.get(`${sessionStorage.url}/conditions.php`,{
//         params:{operation: "getAllConditions"}
//     })

//     let myHtml = `<select id="condition" class="form-select">
//     <option value="" selected disabled>Set Copy Condition</option>
//     `;

//     console.log(response.data);
//     response.data.forEach(condition => {
//         myHtml+=`<option value="${condition.condition_id}">${condition.condition_desc}</option>`;
//     })

//     myHtml+=`</select>`;

//     return myHtml;
// }

// const getAllStatuses = async() => {
//     const response = await axios.get(`${sessionStorage.url}/statuses.php`,{
//         params:{operation: "getAllStatuses"}
//     })

//     let myHtml = `<select id="status" class="form-select">
//     <option value="" selected disabled>Set Copy Status</option>
//     `;

//     console.log(response.data);
//     response.data.forEach(status => {
//         myHtml+=`<option value="${status.status_id}">${status.status_desc}</option>`;
//     })

//     myHtml+=`</select>`;

//     return myHtml;
// }