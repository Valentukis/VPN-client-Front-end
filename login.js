require('dotenv').config();

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
  
    if (loginButton) {
      loginButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the form's default behavior
  
        // Collect input values
        const email = emailInput.value;
        const password = passwordInput.value;
  
        if (!email || !password) {
          alert('Please enter both email and password.');
          setTimeout(() => emailInput.focus(), 10); // Reset focus after alert
          return;
        }
  
        try {
          // Send data to the backend  
          const SERVER_IP = process.env.SERVER_IP;
          const PORT = process.env.PORT;
  
          const response = await fetch(`http://${SERVER_IP}:${PORT}/auth/login`, {
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
            setTimeout(() => emailInput.focus(), 10); // Reset focus after alert
          }
        } catch (error) {
          console.error('Error connecting to the backend:', error);
          alert('An error occurred. Please try again later.');
          setTimeout(() => emailInput.focus(), 10); // Reset focus after alert
        }
      });
    }
  });