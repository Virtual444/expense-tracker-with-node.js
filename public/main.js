

document.addEventListener("DOMContentLoaded", function() {


    
    const signupButton = document.getElementById('signUpbutton');
    if (signupButton) {
        signupButton.addEventListener("click",  async function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
              
             
        
            const user = {
                name:name,
                email:email,
                password:password
            };

            if (!name || !email || !password) {
                
                document.getElementById('message').innerHTML = '<h3>All fields are required.</h3>';
                return;
            }
            console.log(user);
            
                
            try {
                const response = await axios.post(`http://localhost:3000/signup`, user);
            
                console.log(response);
                
                if (response.status === 200) {
                    
                    const message = document.getElementById('message');
                    message.innerHTML = '<h3> Successfully signed up! Redirecting to login page...</h3>'
                    setTimeout(() => {
                        window.location.href = 'http://localhost:3000/login';
                    }, 3000);
                 }
         
                 
        
        
         } catch (error) {
                
                
                if (error.response && error.response.data && error.response.data.message === 'User already Exists') {
                    
                    const message = document.getElementById('message');
                    message.innerHTML = '<h3> User already exists. Please choose a different email or log in.</h3>'
        
                }
                
                else if(error.response && error.response.data && error.response.data.message === 'All fields are required.'){
                    message.innerHTML = '<h3> All fields are required.</h3>'

                }
                else {
                    
                    console.log('An error occurred:', error);
                }
            }
             
        
        })
        
    }

    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener("click", async function(event) {
            event.preventDefault();

            const email = document.getElementById('email');
        const password = document.getElementById('password');
    
        const user = {
            email: email.value,
            password: password.value
        }
    
        try {
           const response =  await axios.post('http://localhost:3000/login', user)
           console.log(response.data);
    
           if (response.status ===  200) {
              
            window.location.href = 'http://localhost:3000/dashboard';

           console.log('Asit Pal');
           }
           
        } catch (error) {

            console.log(error.response);

            if (error.response) {
                const message = document.getElementById('message');

                if (error.response.data && error.response.data.message === 'Used Email is not Registered') {
                    message.innerHTML = '<h3>Email is not Registered</h3>';
                } else if (error.response.data && error.response.data.message === 'All fields are required.') {
                    message.innerHTML = '<h3>All fields are required.</h3>';
                } else if (error.response.data && error.response.data.message === 'Incorrect password') {
                    message.innerHTML = '<h3>Incorrect password.</h3>';
                } else {
                    console.log('An error occurred:', error);
                }
            } else {
                console.log('An error occurred:', error);
            }
           
        }
    

        });

        
    }
    
    
});

function togglePasswordVisibility() {
        var passwordInput = document.getElementById("password");
                
                if (passwordInput.type === "password") {
                    passwordInput.type = "text";
                } else {
                    passwordInput.type = "password";
                }
    }
     