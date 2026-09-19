export const viewBook = async(book_id) => {
    document.getElementById("blank-modal-title").innerText = "View Details";

    const book = await getBook(book_id);
    const authorNames = book.authors.map(a => a.author_name).join(', ');

    const myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Book Title</td>
                <td>
                    ${book.book_title}
                </td>
            </tr>
            <tr>
                <td>Genre</td>  
                <td>
                    ${book.genre_name}
                <td>
            </tr>
            <tr>   
                <td>Authors</td>
                <td>
                    ${authorNames}
                </td>
            </tr>
            <tr>
                <td>Category</td>
                <td>
                    ${book.category_type}
                </td>
            </tr>
            <tr>
                <td>Shelf Location</td>
                <td>
                    ${book.shelf_location}
                </td>
            </tr>      
            <tr>
                <td>Publisher</td>
                <td>
                    ${book.publisher_name}
                </td>
            </tr>
            <tr>
                <td>Added By</td>
                <td>
                    ${book.first_name + " " + book.last_name}
                </td>
            </tr>
            <tr>
                <td>Added At</td>
                <td>
                    ${book.added_at}
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

const getBook = async(book_id) => {
    const params = {
        operation: "getBook",
        json: JSON.stringify({book_id: book_id})
    }

    const response = await axios.get(`${sessionStorage.url}/books.php`,{
        params: params
    })

    console.log(response.data);
    return response.data;
}