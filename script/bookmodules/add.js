let selectedauthors = [];

export const addBook = async(authors, categories, genres, publishers, refreshDisplay) => {
    selectedauthors = [];

    const myModal = new bootstrap.Modal(document.getElementById("blank-modal"), {
        keyboard: true,
        backdrop: "static",
    });

    document.getElementById("blank-modal-title").innerText = "Add Book Details";

    let myHtml = `
        <table class="table table-sm">
            <tr>
                <td>Book Title</td>
                <td>
                    <input type="text" id="book_title" class="form-control" placeholder="ex: Noli Me Tangere">
                </td>
            </tr>
            <tr>
                <td>Author/s</td>  
                <td>
                    ${buildAuthorDropdown(authors)}
                    <div id="selectedauthorslist" class="mt-2"></div>
                </td>
            </tr>
            <tr>
                <td>Category</td>  
                <td>
                    ${buildCategoryDropdown(categories)}
                </td>
            </tr>
            <tr>   
                <td>Genre</td>
                <td>
                    ${buildGenreDropdown(genres)}
                </td>
            </tr>
            <tr>
                <td>Publisher</td>
                <td>
                    ${buildPublisherDropdown(publishers)}
                </td>
            </tr>
            <tr>
                <td>Shelf Location</td>
                <td>
                    <input type="text" id="shelf_location" class="form-control" placeholder="ex: A1-01"> 
                </td>
            </tr>      
        </table>
    `;
    document.getElementById("blank-main-div").innerHTML = myHtml;

    renderSelectedAuthors();

    document.getElementById('author').addEventListener('change', (e) => {
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
        <button type="button" class="btn btn-primary btn-sm w-100 add">Add Book</button>
        <button type="button" class="btn btn-secondary btn-sm w-100" data-bs-dismiss="modal">Close</button>
    `;
    modalFooter.innerHTML = myHtml;

    modalFooter.querySelector(".add").addEventListener('click', async() => {
        if(await addBookDetails() == 1){
            refreshDisplay();
            alert("Successfully added book details");
            myModal.hide();
        }
        else{
            alert("Failed to add book");
        }
    })

    myModal.show();
}

const addBookDetails = async() => {
    const book = {
        book_title: document.getElementById('book_title').value,
        category_id: document.getElementById('category').value,
        genre_id: document.getElementById('genre').value,
        publisher_id: document.getElementById('publisher').value,
        shelf_location: document.getElementById('shelf_location').value,
        added_by: `${sessionStorage.userId}`
    };

    const authorIds = selectedauthors.map(a => a.author_id);

    const jsonData = {book: book, authors: authorIds};

    const formData = new FormData();
    formData.append('operation', "addBook");
    formData.append('json', JSON.stringify(jsonData));

    const response = await axios({
        url: `${sessionStorage.url}/books.php`,
        method: "POST",
        data: formData
    })

    console.log(response.data);
    return response.data;
}

const buildGenreDropdown = (genres) => {
    let genreSelect = `<select id="genre" class="form-select">
    <option value="" selected disabled>Select Genre</option>`;

    genres.forEach(genre => {
        genreSelect+=`<option value="${genre.genre_id}">${genre.genre_name}</option>`;
    })
    
    genreSelect+=`</select>`;

    return genreSelect;
}

const buildCategoryDropdown = (categories) => {
    let categorySelect = `<select id="category" class="form-select">
    <option value="" selected disabled>Select Category</option>`;

    categories.forEach(category => {
        categorySelect+=`<option value="${category.category_id}">${category.category_type}</option>`;
    })
    
    categorySelect+=`</select>`;

    return categorySelect;
}

const buildAuthorDropdown = (authors) => {
    let authorSelect = `<select id="author" class="form-select">
    <option value="" selected disabled>Select an author to add</option>`;

    authors.forEach(author => {
        authorSelect+=`<option value="${author.author_id}">${author.author_name}</option>`;
    })
    
    authorSelect+=`</select>`;

    return authorSelect;
}

const renderSelectedAuthors = () => {
    const listDiv = document.getElementById('selectedauthorslist');
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

const buildPublisherDropdown = (publishers) => {
    let publisherSelect = `<select id="publisher" class="form-select">
    <option value="" selected disabled>Select Publisher</option>`;

    publishers.forEach(publisher => {
        publisherSelect+=`<option value="${publisher.publisher_id}">${publisher.publisher_name}</option>`;
    })
    
    publisherSelect+=`</select>`;
    return publisherSelect;
}