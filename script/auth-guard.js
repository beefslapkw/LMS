const apiUrl = `${location.origin}/LMS/api`;
const appUrl = `${location.origin}/LMS`;

const roleHome = {
    1: `${appUrl}/templates/headLibrarian.php`,
    2: `${appUrl}/templates/studentAssistant.php`,
    3: `${appUrl}/templates/student.php`,
    4: `${appUrl}/templates/faculty.php`
}

const redirectToLogin = () => {
    sessionStorage.clear();
    location.replace(`${appUrl}/`);
}

//gamit sa logout button: onclick="appLogout()"
const appLogout = async() => {
    const formData = new FormData();
    formData.append("operation", "logout");

    try{
        await axios({
            url: `${apiUrl}/users.php`,
            method: "POST",
            data: formData
        })
    }
    catch(err){
        //expired na ang session, padayon lang sa login
    }
    redirectToLogin();
}

(() => {
    const script = document.currentScript;
    const allowedRoles = ((script && script.dataset.roles) || '')
        .split(',')
        .map(role => parseInt(role, 10))
        .filter(role => Number.isInteger(role));

    //tagoa ang page hangtod ma-verify ang session
    document.documentElement.style.visibility = 'hidden';

    axios.interceptors.response.use(
        response => response,
        error => {
            const status = error.response && error.response.status;

            if(status === 401){
                redirectToLogin();
                return new Promise(() => {});
            }
            if(status === 403 && window.Swal){
                Swal.fire({ title: 'Not allowed', text: 'You do not have permission to do that.', icon: 'error' });
            }
            if(status === 405){
                console.error('405: kinahanglan POST ning operation', error.config && error.config.params);
            }
            return Promise.reject(error);
        }
    );

    //authReady.then(me => ...) sa page scripts kung kinahanglan ang verified user
    window.authReady = (async() => {
        try{
            const response = await axios.get(`${apiUrl}/users.php`, {
                params: { operation: "me" }
            })
            const me = response.data;

            if(!me || !me.user_id){
                throw new Error('not logged in');
            }

            const role = Number(me.role_id);
            if(allowedRoles.length && !allowedRoles.includes(role)){
                location.replace(roleHome[role] || `${appUrl}/`);
                return new Promise(() => {});
            }

            sessionStorage.setItem('fullname', me.fullname);
            sessionStorage.setItem('userId', me.user_id);
            window.currentUser = me;

            document.documentElement.style.visibility = '';
            return me;
        }
        catch(err){
            redirectToLogin();
            return new Promise(() => {});
        }
    })();

    //back button human sa logout: ayaw pakita ang cached page
    window.addEventListener('pageshow', (e) => {
        if(e.persisted){
            location.reload();
        }
    })
})();