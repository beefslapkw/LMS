const url = "http://localhost/LMS/api";

const login = async() => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const params = {
        operation: "login",
        json: JSON.stringify({"username": username, "password": password})
    }

    const response = await axios.get(`${url}/users.php`, {
        params:params
    });
    
    console.log(response.data);
    if(response.data.username == username){
        sessionStorage.setItem("fullname", response.data.first_name + " " + response.data.last_name);
        switch(response.data.role_id){
            case 1:
                window.location.href = "./templates/headLibrarian.html";
                break;
            case 2:
                window.location.href = "./templates/studentAssistant.html";
                break;
            case 3:
                window.location.href = "./templates/student.html";
                break;
            case 4:
                window.location.href = "./templates/faculty.html";
                break;
            default:
                alert("ERROR");
                break;
        }
    }
    else{
        alert(response.data);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login').addEventListener('click', () => {
        login();
    })
})