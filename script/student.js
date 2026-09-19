const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);

document.getElementById('welcome').innerHTML = `Welcome Student ${sessionStorage.fullname}`;

let allBooks = []; 

const getCatalog = async() => {
    const catalogtablediv = document.getElementById('catalogtablediv');

    const response = await axios.get(`${url}/books.php`,{
        params:{operation:"getAllBooks"}
    })

    if(response.status == 200){
        console.log(response.data);
        allBooks = response.data;
        renderCatalog(allBooks);
    }
    else{
        alert("ERROR");
    }
}

const renderCatalog = (books) => {
    const catalogtablediv = document.getElementById('catalogtablediv');
    catalogtablediv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Book Title</th>
            <th>Genre</th>
            <th>Authors</th>
            <th>Category</th>
            <th>Publisher</th>
            <th>Shelf Location</th>
        </tr>
    `;
    table.appendChild(thead);
    table.classList.add("table", "table-hover", "table-striped", "table-sm");
    const tbody = document.createElement('tbody');

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.book_title}</td>
            <td>${book.genre_name}</td>
            <td>${book.authors}</td>
            <td>${book.category_type}</td>
            <td>${book.publisher_name}</td>
            <td>${book.shelf_location}</td>
        `;
        tbody.appendChild(row);
    })

    table.appendChild(tbody);
    catalogtablediv.appendChild(table);
}

document.getElementById('searchbar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    const filtered = [];

    allBooks.forEach(book => {
        let title = book.book_title;
        if(!title){
            title = "";
        }

        let authors = book.authors;
        if(!authors){
            authors = "";
        }

        let genre = book.genre_name;
        if(!genre){
            genre = "";
        }

        let matches = false;
        if(title.toLowerCase().includes(query)){
            matches = true;
        }
        else if(authors.toLowerCase().includes(query)){
            matches = true;
        }
        else if(genre.toLowerCase().includes(query)){
            matches = true;
        }

        if(matches){
            filtered.push(book);
        }
    })

    renderCatalog(filtered);
})

const getMyBorrowedBooks = async() => {
    const borrowedtablediv = document.getElementById('borrowedtablediv');
    borrowedtablediv.innerHTML = `<p class="text-muted">WIP.</p>`;
    document.getElementById('borrowedcount').innerText = "-";
}

const getMyFines = async() => {
    const finestablediv = document.getElementById('finestablediv');
    finestablediv.innerHTML = `<p class="text-muted">WIP.</p>`;
    document.getElementById('finecount').innerText = "-";
}

const getAvailableCount = async() => {
    const response = await axios.get(`${url}/bookcopies.php`,{
        params:{operation:"getAllCopies"}
    })

    if(response.status == 200){
        const availableCopies = response.data.filter(copy => copy.status_desc == "Available");
        document.getElementById('availablecount').innerText = availableCopies.length;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCatalog();
    getMyBorrowedBooks();
    getMyFines();
    getAvailableCount();
})