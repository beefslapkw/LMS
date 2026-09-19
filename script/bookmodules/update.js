let selectedauthors = [];

export const updateBook = async(book_id, authors, categories, genres, publishers, refreshDisplay) => {
    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Update Book Details";
    const book = await getBook(book_id);
    selectedauthors = book.authors;

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Book Title</td>
                <td>
                    <input type="text" id="nbook_title" class="form-control" value="${book.book_title}">
                </td>
            </tr>
            <tr>
                <td>Author/s</td>  
                <td>
                    ${buildAuthorDropdown(authors)}
                    <div id="nselectedauthorslist" class="mt-2"></div>
                </td>
            </tr>
            <tr>
                <td>Category</td>  
                <td>
                    ${buildCategoryDropdown(categories, book.category_id)}
                </td>
            </tr>
            <tr>   
                <td>Genre</td>
                <td>
                    ${buildGenreDropdown(genres, book.genre_id)}
                </td>
            </tr>
            <tr>
                <td>Publisher</td>
                <td>
                    ${buildPublisherDropdown(publishers, book.publisher_id)}
                </td>
            </tr>
            <tr>
                <td>Shelf Location</td>
                <td>
                    <input type="text" id="nshelf_location" class="form-control" value="${book.shelf_location}"> 
                </td>
            </tr>      
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    renderSelectedAuthors();

    document.getElementById('nauthor').addEventListener('change', (e) => {
        const authorId = e.target.value;
        const alreadyAdded = selectedauthors.some(a => a.author_id == authorId);
        if(!alreadyAdded){
            const author = authors.find(a => a.author_id == authorId);
            selectedauthors.push(author);
            renderSelectedAuthors();
        }
        e.target.value = ""; 
    })

    const modalFooter = document.getElementById("blank-modal-footer");
    myHtml = `
        <button type="button" class="btn btn-primary btn-sm w-100 update">Save Changes</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".update").addEventListener('click', async() => {
        if(await updateBookDetails(book_id) == 1){
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

const updateBookDetails = async(book_id) => {
    const book = {
        book_id: book_id,
        book_title: document.getElementById('nbook_title').value,
        category_id: document.getElementById('ncategory').value,
        genre_id: document.getElementById('ngenre').value,
        publisher_id: document.getElementById('npublisher').value,
        shelf_location: document.getElementById('nshelf_location').value,
        added_by: `${sessionStorage.userId}`
    };

    const authorIds = selectedauthors.map(a => a.author_id);

    const jsonData = {book: book, authors: authorIds};

    const formData = new FormData();
    formData.append('operation', "updateBook");
    formData.append('json', JSON.stringify(jsonData));

    const response = await axios({
        url: `${sessionStorage.url}/books.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}

const buildGenreDropdown = (genres, genre_id) => {
    let genreSelect = `<select id="ngenre" class="form-select">`;

    genres.forEach(genre => {
        let selected = genre_id == genre.genre_id ? "selected" : "";
        genreSelect+=`<option value="${genre.genre_id}" ${selected}>${genre.genre_name}</option>`;
    })
    
    genreSelect+=`</select>`;

    return genreSelect;
}

const buildCategoryDropdown = (categories, category_id) => {
    let categorySelect = `<select id="ncategory" class="form-select">`;

    categories.forEach(category => {
        let selected = category_id == category.category_id ? "selected" : "";
        categorySelect+=`<option value="${category.category_id}" ${selected}>${category.category_type}</option>`;
    })
    
    categorySelect+=`</select>`;

    return categorySelect;
}

const buildAuthorDropdown = (authors) => {
    let authorSelect = `<select id="nauthor" class="form-select">
    <option value="" selected disabled>Select an author to add</option>`;

    authors.forEach(author => {
        authorSelect+=`<option value="${author.author_id}">${author.author_name}</option>`;
    })
    
    authorSelect+=`</select>`;

    return authorSelect;
}

const renderSelectedAuthors = () => {
    const listDiv = document.getElementById('nselectedauthorslist');
    listDiv.innerHTML = '';

    selectedauthors.forEach(author => {
        const item = document.createElement('div');
        item.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'border', 'rounded', 'px-2', 'py-1', 'mb-1');
        item.innerHTML = `
            <span>${author.author_name}</span>
            <button type="button" class="btn btn-sm btn-outline-danger remove">&times;</button>
        `;
        item.querySelector('.remove').addEventListener('click', () => {
            selectedauthors = selectedauthors.filter(a => a.author_id != author.author_id);
            renderSelectedAuthors();
        })
        listDiv.appendChild(item);
    })
}

const buildPublisherDropdown = (publishers, publisher_id) => {
    let publisherSelect = `<select id="npublisher" class="form-select">`;

    publishers.forEach(publisher => {
        let selected = publisher_id == publisher.publisher_id ? "selected" : "";
        publisherSelect+=`<option value="${publisher.publisher_id}" ${selected}>${publisher.publisher_name}</option>`;
    })
    
    publisherSelect+=`</select>`;
    return publisherSelect;
}