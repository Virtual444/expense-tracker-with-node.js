
document.addEventListener("DOMContentLoaded", function(){

    const signupButton = document.getElementById('button');
    signupButton.addEventListener("click", function() {

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

        

        const user = {
            name:name,
            email:email,
            password:password
        };
        console.log(user);

        axios.post(`http://localhost:3000/user/signup`, user)
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.log(err);

        });



    });
});