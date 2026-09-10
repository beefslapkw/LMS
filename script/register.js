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
    const lastn = document.getElementById('lastn').value;
    const firstn = document.getElementById('firstn').value;
    const contact = document.getElementById('contact').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const department = departmentlist.value;

    if(!idnum || !lastn || !firstn || !contact || !email || !username || !password || !department){
        alert("Please fill out all the required fields");
        return;
    }
    if(!email.includes("@") || !email.includes(".com")){
        alert("Invalid email address");
        return;
    }

    const jsondata = {
        id_number: idnum,
        last_name: lastn,
        first_name: firstn,
        contact_number: contact,
        email_address: email,
        username: username,
        password: password,
        department_id: department
    }

    const formData = new FormData();
    formData.append("operation", "addUser");
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
    document.getElementById('register').addEventListener('click', () => {
        register();
    })
})