const url = "http://localhost/LMS/api";
const departmentlist = document.getElementById('department');

const getAllDepartments = async() => {
    const response = await axios.get(`${url}/departments.php`,{
        params:{operation:"getAllDepartments"}
    })

    if(response.status == 200){
        console.log(response.data);
        response.data.forEach(department => {
            const opt = document.createElement('option');
            opt.value = department.department_id;
            opt.innerText = department.department_name;

            departmentlist.appendChild(opt);
        })
    }
    else{
        alert("ERROR");
    }
}

const register = async() => {
    const idnum = document.getElementById('idnum').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const jsondata = {
        username: username,
        password: password
    }

    const formData = new FormData();
    formData.append("operation", "register");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${url}/users.php`,
        method: "POST",
        data: formData
    })

    if(response.data == 1){
        alert("Successfully Registered");
    }
    else{
        alert("ERROR");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    getAllDepartments();
})