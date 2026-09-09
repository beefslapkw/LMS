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
    
    if(response.data.username == username){
        sessionStorage.setItem("fullname", response.data.last_name + response.data.first_name);
        switch(response.data.role_id){
            case 1:
                window.location.href = "headLibrarian.html";
                break;
            case 2:
                window.location.href = "studentAssistant.html";
                break;
            case 3:
                window.location.href = "student.html";
                break;
            case 4:
                window.location.href = "faculty.html";
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