document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');

  if (loginButton) {
      loginButton.addEventListener('click', async (event) => {
          event.preventDefault(); // Prevent the form's default behavior

          // Collect input values
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;

          if (!email || !password) {
              alert('Please enter both email and password.');
              return;
          }

          try {
              // Send data to the backend
              const response = await fetch('http://localhost:3000/auth/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, password }),
              });

              if (response.status === 200) {
                  const data = await response.json();
                  alert(data.message); // "Login successful!"
                  window.location.href = "dashboard.html"; // Redirect on success
              } else {
                  const errorData = await response.json();
                  alert(`Error: ${errorData.error}`); // Show backend error
              }
          } catch (error) {
              console.error('Error connecting to the backend:', error);
              alert('An error occurred. Please try again later.');
          }
      });
  }
});
