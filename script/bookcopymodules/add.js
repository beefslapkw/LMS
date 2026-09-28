let selectedBookId = null;

export const addCopy = async(refreshDisplay) => {
    selectedBookId = null;

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
                    <input type="text" id="booksearch" class="form-control mb-1" placeholder="Search book title...">
                    <div id="booklist" class="list-group" style="max-height: 180px; overflow-y: auto;"></div>
                    <div id="selectedbook" class="form-text"></div>
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
    searchBooks("");

    let searchTimer;
    document.getElementById('booksearch').addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => searchBooks(e.target.value), 300);
    });   

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Copies</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        const qty = Number(document.getElementById('qty').value);

        if(!selectedBookId){
            alert("Please select a book");
            return;
        }
        if(!Number.isInteger(qty) || qty < 1){
            alert("Please enter a valid amount of copies");
            return;
        }

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

const searchBooks = async(term) => {
    const list = document.getElementById('booklist');

    try{
        const response = await axios.get(`${sessionStorage.url}/books.php`, {
            params: {operation: "getBookOptions", json: JSON.stringify({search: term})}
        });

        list.innerHTML = '';

        if(!Array.isArray(response.data) || response.data.length == 0){
            list.innerHTML = `<div class="list-group-item text-muted">No books found</div>`;
            return;
        }

        response.data.forEach(book => {
            const item = document.createElement('button');
            item.type = 'button';
            item.classList.add('list-group-item', 'list-group-item-action');
            //ikeep ang selection bisan mag search utro
            if(book.book_id == selectedBookId){
                item.classList.add('active');
            }
            item.textContent = book.book_title;

            item.addEventListener('click', () => {
                selectedBookId = book.book_id;
                document.getElementById('selectedbook').textContent = `Selected: ${book.book_title}`;
                list.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            });

            list.appendChild(item);
        });
    }
    catch(err){
        console.error(err);
        list.innerHTML = `<div class="list-group-item text-danger">Failed to load books</div>`;
    }
};

const addCopyDetails = async() => {
    const jsondata = {
        book_id: selectedBookId,
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