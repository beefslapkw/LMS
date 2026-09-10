const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);

document.getElementById('welcome').innerHTML = `Welcome Student Assistant ${sessionStorage.fullname}`;

const getAllBooks = async() => {
    const bookstablediv = document.getElementById('bookstablediv');

    const response = await axios.get(`${url}/books.php`,{
        params:{operation:"getAllBooks"}
    })

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Book Title</th>
            <th>Genre</th>
            <th>Authors</th>
            <th>Category</th>
            <th>Shelf Location</th>
            <th>Publisher</th>
            <th>Added By</th>
            <th>Added At</th>
            <th>Status</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('bookscard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #006666;">
                <small class="text-uppercase fw-semibold">Total Books Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(book => { 
            let status;
            let statusButtons;
            if(book.is_active == 1){
                status = "Active";
                statusButtons = `<button class="btn btn-danger btn-sm deactivate">De-activate</button>`;
            }
            else if(book.is_active == 0){
                status = "Inactive";
                statusButtons = `<button class="btn btn-primary btn-sm reactivate">Re-activate</button>`;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.book_title}</td>
                <td>${book.genre_name}</td>
                <td>${book.authors}</td>
                <td>${book.category_type}</td>
                <td>${book.shelf_location}</td>
                <td>${book.publisher_name}</td>
                <td>${book.first_name + " " + book.last_name}</td>
                <td>${book.added_at}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-secondary btn-sm view">View</button>
                    <button class="btn btn-success btn-sm update">Update</button>
                    ${statusButtons}
                </td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        bookstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllCopies = async() => {
    const copiestablediv = document.getElementById('copiestablediv');

    const response = await axios.get(`${url}/bookcopies.php`,{
        params:{operation:"getAllCopies"}
    })

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Book Title</th>
            <th>Accession Number</th>
            <th>Condition</th>
            <th>Condition Notes</th>
            <th>Added By</th>
            <th>Added At</th>
            <th>Status</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('copiescard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #00a8a8;">
                <small class="text-uppercase fw-semibold">Total Book Copies Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(copy => { 
            let condition;
            if(!copy.condition_notes){
                condition = "N/A";
            }
            else{
                condition = copy.condition_notes;
            }
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${copy.book_title}</td>
                <td>${copy.accession_number}</td>
                <td>${copy.condition_desc}</td>
                <td>${condition}</td>
                <td>${copy.first_name + " " + copy.last_name}</td>
                <td>${copy.added_at}</td>
                <td>${copy.status_desc}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        copiestablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllAuthors = async() => {
    const authorstablediv = document.getElementById('authorstablediv');

    const response = await axios.get(`${url}/authors.php`,{
        params:{operation:"getAllAuthors"}
    })

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Author ID</th>
            <th>Author Name</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('authorscard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #e68a00;">
                <small class="text-uppercase fw-semibold">Total Authors Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(author => { 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.author_id}</td>
                <td>${author.author_name}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        authorstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

const getAllPublishers = async() => {
    const publisherstablediv = document.getElementById('publisherstablediv');

    const response = await axios.get(`${url}/publishers.php`,{
        params:{operation:"getAllPublishers"}
    })

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Publisher ID</th>
            <th>Publisher Name</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    if(response.status == 200){
        console.log(response.data);
        document.getElementById('publisherscard').innerHTML = `
            <div class="card text-white shadow-sm p-3" style="background-color: #00a8a8;">
                <small class="text-uppercase fw-semibold">Total Publishers Quantity</small>
                <h2 class="display-6 fw-bold my-2 text-center">${response.data.length}</h2>
            </div>
        `;
        response.data.forEach(publisher => { 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${publisher.publisher_id}</td>
                <td>${publisher.publisher_name}</td>
            `;
            tbody.appendChild(row);
        })
        table.appendChild(tbody);
        publisherstablediv.appendChild(table);
    }
    else{
        alert("ERROR");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getAllBooks();
    getAllCopies();
    getAllAuthors();
    getAllPublishers();
})