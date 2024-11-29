document.addEventListener('DOMContentLoaded', () => {
  const registerButton = document.getElementById('registerButton');
  const registerForm = document.getElementById('registerForm');

  // Add event listeners to clear inputs on first character
  const fields = ['email', 'password', 'confirm_password'];
  fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
          field.addEventListener('input', function() {
              if (this.dataset.cleared !== "true" && this.value.length === 1) {
                  this.value = ''; // Clear the field
                  this.dataset.cleared = "true"; // Mark as cleared
              }
          });

          // Reset the cleared flag on focus
          field.addEventListener('focus', function() {
              this.dataset.cleared = "false";
          });
      }
  });

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
