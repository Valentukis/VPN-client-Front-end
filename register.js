document.addEventListener('DOMContentLoaded', () => {
  const registerButton = document.getElementById('registerButton');
  const registerForm = document.getElementById('registerForm');

  if (registerButton) {
      registerButton.addEventListener('click', (event) => {
          event.preventDefault(); // Prevent default form submission

          // Check if the form is valid
          if (registerForm.reportValidity()) {
              const email = document.getElementById('email').value;
              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirm_password').value;

              if (password === confirmPassword) {
                  console.log(`Email: ${email}, Password: ${password}`);
                  // Redirect or perform any desired action
                  window.location.href = "dashboard.html";
              } else {
                  alert("Passwords do not match. Please try again.");
              }
          } else {
              console.log('Invalid input detected');
          }
      });
  }
});
