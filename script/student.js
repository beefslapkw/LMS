const url = "http://localhost/LMS/api";
sessionStorage.setItem("url", url);

document.getElementById('welcome').innerHTML = `Welcome Student ${sessionStorage.fullname}`;