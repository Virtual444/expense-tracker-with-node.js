document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.getElementById("loginButton");
  const signupButton = document.getElementById("signUpbutton");
  const forgotPassword = document.getElementById("forgot-password");
  const updatePassword = document.getElementById("newPassword");

  if (signupButton) {
    signupButton.addEventListener("click", async function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const user = {
        name: name,
        email: email,
        password: password,
      };

      if (!name || !email || !password) {
        document.getElementById("message").innerHTML =
          "<h3>All fields are required.</h3>";
        alert("All fields are required.");
        return;
      }

      try {
        const response = await axios.post(`http://localhost:3000/signup`, user);

        console.log(response);

        if (response.status === 200) {
          const message = document.getElementById("message");
          message.innerHTML =
            "<h3> Successfully signed up! Redirecting to login page...</h3>";
          setTimeout(() => {
            window.location.href = "http://localhost:3000/login";
          }, 3000);
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message === "User already Exists"
        ) {
          alert(
            "User already exists. Please choose a different email or log in."
          );
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.message === "All fields are required."
        ) {
          alert(" All fields are required.");
        } else {
          console.log("An error occurred:", error);
        }
      }
    });
  }

  if (loginButton) {
    loginButton.addEventListener("click", async function (event) {
      event.preventDefault();

      const email = document.getElementById("email");
      const password = document.getElementById("password");

      const user = {
        email: email.value,
        password: password.value,
      };

      try {
        const response = await axios.post("http://localhost:3000/login", user);
        //    console.log(response.data);

        if (response.status === 200) {
          localStorage.setItem("token", response.data.token);
          window.location.href = "http://localhost:3000/user/dashboard";
        }
      } catch (error) {
        console.log(error.response);

        if (error.response) {
          if (
            error.response.data &&
            error.response.data.message === "Used Email is not Registered"
          ) {
            alert("Email is not Registered");
          } else if (
            error.response.data &&
            error.response.data.message === "All fields are required."
          ) {
            alert("All fields are required.");
          } else if (
            error.response.data &&
            error.response.data.message === "Password is not correct"
          ) {
            alert("Incorrect password.");
          } else {
            console.log("An error occurred:", error);
          }
        } else {
          console.log("An error occurred:", error);
        }
      }
    });
  }

  if (forgotPassword) {
    forgotPassword.addEventListener("click", async function (event) {
      event.preventDefault();
      try {
        const email = document.getElementById("email").value;
        const response = await axios.post(
          "http://localhost:3000/password/forgot-password",
          { email }
        );
        console.log(response.data);
        if (response.status == 200) {
          const data = response.data;
          if (data.message) {
            alert(data.message);
            location.reload();
          } else {
            alert("Password reset failed. Please try again");
            location.reload();
          }
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.log("Error:", error);
        alert(error.response.data.message);
        location.reload();
      }
    });
  }

  if (updatePassword) {
    updatePassword.addEventListener("click", async function (event) {
      event.preventDefault();

      try {
        const password = document.getElementById("password").value;
        const requestId = window.location.pathname.split("/").pop();
        const response = await axios.post(
          `http://localhost:3000/password/reset-password/${requestId}`,
          { password }
        );
        console.log(response);
        if (response.status === 200) {
          alert("Password Reset Successfully");
          window.location.href = "http://localhost:3000/login";
        } else {
          console.error("Password reset failed:", response.data.message);
        }
      } catch (error) {
        console.error("An error occurred:", error);
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
