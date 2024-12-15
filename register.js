document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('registerButton');
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.createElement('div'); // Add dynamic error message
    errorMessage.style.color = 'red';
    errorMessage.style.marginTop = '10px';
    registerForm.appendChild(errorMessage);

    if (registerButton) {
        registerButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Clear previous error message
            errorMessage.textContent = '';

            // Validate form inputs
            if (registerForm.reportValidity()) {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirm_password').value;

                // Check if passwords are at least 8 characters
                if (password.length < 8) {
                    errorMessage.textContent = 'Password must be at least 8 characters long.';
                    document.getElementById('password').focus(); // Focus on password field
                    return;
                }

                // Check if passwords match
                if (password !== confirmPassword) {
                    errorMessage.textContent = 'Passwords do not match. Please try again.';
                    document.getElementById('password').focus(); // Focus on password field
                    return;
                }

                try {
                    // Send data to the backend
                    const SERVER_IP = process.env.SERVER_IP || 'localhost';
                    const PORT = process.env.PORT || '3000';

                    const response = await fetch(`http://${SERVER_IP}:${PORT}/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });

                    if (response.status === 201) {
                        const data = await response.json();
                        errorMessage.style.color = 'green';
                        errorMessage.textContent = data.message || 'Registration successful!';
                        registerForm.reset(); // Clear the form
                        setTimeout(() => {
                            window.location.href = "dashboard.html"; // Redirect after success
                        }, 1000); // Redirect after 1 second
                    } else {
                        const errorData = await response.json();
                        errorMessage.textContent = errorData.error || 'Registration failed.';
                    }
                } catch (error) {
                    console.error('Error connecting to the backend:', error);
                    errorMessage.textContent = 'An error occurred. Please try again later.';
                }
            } else {
                errorMessage.textContent = 'Please fill out all fields correctly.';
            }
        });
    }
});
