const url = `${location.origin}/LMS/api`;

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
        switch(response.data.role_id){
            case 1:
                window.location.href = "./templates/headLibrarian.php";
                break;
            case 2:
                window.location.href = "./templates/studentAssistant.php";
                break;
            case 3:
                window.location.href = "./templates/student.php";
                break;
            case 4:
                window.location.href = "./templates/faculty.php";
                break;
            default:
                alert("ERROR");
                break;
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
    document.getElementById('login').addEventListener('click', () => {
        login();
    })
})