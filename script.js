const login = async() => {
    const url = "http://localhost/LMS";

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
        switch(response.data.role_id){
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
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