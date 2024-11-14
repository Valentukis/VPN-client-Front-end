// renderer.js
const db = require('./database');

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        const [results] = await db.execute(query, [email, password]);

        if (results.length > 0) {
            document.getElementById('loginMessage').textContent = 'Login successful!';
            document.getElementById('loginMessage').style.color = 'green';
        
            // Store the user's email in sessionStorage
            sessionStorage.setItem('userEmail', email);
        
            // Redirect to the dashboard
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('loginMessage').textContent = 'Invalid email or password';
            document.getElementById('loginMessage').style.color = 'red';
        }
    } catch (err) {
        document.getElementById('loginMessage').textContent = 'Error logging in: ' + err.message;
        document.getElementById('loginMessage').style.color = 'red';
    }
});
