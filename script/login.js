const url = `${location.origin}/LMS/api`;

const roleHome = {
    1: "./templates/headLibrarian.html",
    2: "./templates/studentAssistant.html",
    3: "./templates/student.html",
    4: "./templates/faculty.html"
}

//if naa nay active session, diretso sa dashboard
const redirectIfLoggedIn = async() => {
    try{
        const response = await axios.get(`${url}/users.php`, {
            params: { operation: "me" }
        })
        const target = roleHome[Number(response.data && response.data.role_id)];
        if(target){
            location.replace(target);
            return;
        }
    }
    catch(err){
        //401 = wala pa naka-login, ipakita ang login form
    }
    document.documentElement.style.visibility = 'visible';
}

const login = async() => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const jsondata = {
        username: username,
        password: password
    }

    const formData = new FormData();
    formData.append("operation", "login");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${url}/users.php`,
        method: "POST",
        data: formData
    })

    if(response.data.user_id){
        sessionStorage.setItem("fullname", response.data.first_name + " " + response.data.last_name);
        sessionStorage.setItem("userId", response.data.user_id);
        const target = roleHome[Number(response.data.role_id)];
        if(target){
            window.location.href = target;
        }
        else{
            alert("ERROR");
        }
    }
    else{
        Swal.fire({
            title: 'Failed',
            text: response.data,
            icon: 'error'
        })
    }
}

document.addEventListener('DOMContentLoaded', () => {
    redirectIfLoggedIn();
    document.getElementById('login').addEventListener('click', () => {
        login();
    })
})

//back button gikan sa dashboard: i-recheck ang session
window.addEventListener('pageshow', (e) => {
    if(e.persisted){
        redirectIfLoggedIn();
    }
})