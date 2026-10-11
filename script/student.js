const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);

document.getElementById('welcome').innerHTML = `Welcome Student ${sessionStorage.fullname}`;

let allBooks = []; 

const renderPagination = (container, curPage, totalPages, goTo) => {
    if(totalPages <= 1) return;

    const pagination = document.createElement('div');
    pagination.classList.add('d-flex', 'justify-content-center', 'gap-2', 'mt-2');

    const addBtn = (label, page, active = false, disabled = false) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.className = active ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-secondary';
        btn.disabled = disabled;
        btn.addEventListener('click', () => goTo(page));
        pagination.appendChild(btn);
    };

    addBtn('Prev', curPage - 1, false, curPage <= 1);

    const start = Math.max(1, curPage - 2);
    const end = Math.min(totalPages, curPage + 2);

    if(start > 1){
        addBtn('1', 1);
        if(start > 2) addBtn('...', curPage, false, true);
    }
    for(let i = start; i <= end; i++){
        addBtn(i, i, i === curPage);
    }
    if(end < totalPages){
        if(end < totalPages - 1) addBtn('...', curPage, false, true);
        addBtn(totalPages, totalPages);
    }

    addBtn('Next', curPage + 1, false, curPage >= totalPages);

    container.appendChild(pagination);
};


let currentCatalogPage = 1;
const booksPerPage = 10;

const getCatalog = async(page = 1) => {
    currentCatalogPage = page;

    const response = await axios.get(`${url}/books.php`,{
        params:{operation:"getAllBooks", json: JSON.stringify({ page: page, limit: booksPerPage })}
    })

    if(response.status == 200){
        console.log(response.data.data);
        allBooks = response.data;
        console.log(allBooks);
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

    books.data.forEach(book => {
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

    renderPagination(catalogtablediv, books.page, books.totalPages, getCatalog);
}

document.getElementById('searchbar').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    const filtered = allBooks.data.filter(book =>
        (book.book_title || "").toLowerCase().includes(query) ||
        (book.authors || "").toLowerCase().includes(query) ||
        (book.genre_name || "").toLowerCase().includes(query)
    );

    renderCatalog({ ...allBooks, data: filtered });
});

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
        params:{operation:"getAvailableCount"}
    })

    if(response.status == 200){
        document.getElementById('availablecount').innerText = response.data;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getCatalog();
    getMyBorrowedBooks();
    getMyFines();
    getAvailableCount();
})