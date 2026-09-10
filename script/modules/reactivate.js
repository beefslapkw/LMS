export const reactivateUser = async(user_id, refreshDisplay) => {
    const displaydiv = document.getElementById('display');

    displaydiv.innerHTML = `
        <p>Are you sure you want to reactivate this account?</p> <br>
        <button id="yes">Yes</button>
        <button id="no">No</button>
    `;
    displaydiv.style.display = "block";

    document.getElementById('yes').addEventListener('click', async() => {
        if(await reactivateUserDetails(user_id) == 1){
            alert("Successfully reactivated user");
            displaydiv.style.display = "none";
            refreshDisplay();
        }
        else{
            alert("Failed to reactivate user");
        }
    })
    document.getElementById('no').addEventListener('click', () => {
        displaydiv.style.display = "none";
    })
}

const reactivateUserDetails = async(user_id) => {
    const jsondata = {
        user_id: user_id,
    };

    const formData = new FormData();
    formData.append("operation", "reactivateUser");
    formData.append("json", JSON.stringify(jsondata));

    const response = await axios({
        url: `${sessionStorage.url}/users.php`,
        method: "POST",
        data: formData
    })

    return response.data;
}