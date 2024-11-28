document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
  
    if (loginButton) {
      loginButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the form's default behavior
  
        // Placeholder logic: Simulate a successful login
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
  
        console.log(`Email: ${email}, Password: ${password}`);
  
        // Redirect to the dashboard page
        window.location.href = "dashboard.html";
      });
    }
  });
  