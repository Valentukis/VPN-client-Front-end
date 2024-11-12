// register.js
const db = require('./database');

// Function to register a new user
document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic password confirmation check
    if (password !== confirmPassword) {
        document.getElementById('registerMessage').textContent = 'Passwords do not match';
        document.getElementById('registerMessage').style.color = 'red';
        return;
    }

    try {
        const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
        await db.execute(query, [email, password]);
        
        document.getElementById('registerMessage').textContent = 'Registration successful! Redirecting to login...';
        document.getElementById('registerMessage').style.color = 'green';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            document.getElementById('registerMessage').textContent = 'Email already exists';
        } else {
            document.getElementById('registerMessage').textContent = 'Error registering user: ' + err.message;
        }
        document.getElementById('registerMessage').style.color = 'red';
    }
});
