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

                // Simulate Mock API Response
                const mockApiResponse = mockRegisterApi(email, password);

                // Handle Mock API Response
                if (mockApiResponse.success) {
                    errorMessage.style.color = 'green';
                    errorMessage.textContent = 'Registration successful!';
                    registerForm.reset(); // Clear the form
                    setTimeout(() => {
                        window.location.href = "dashboard.html"; // Redirect after success
                    }, 1000); // Redirect after 1 second
                } else {
                    errorMessage.textContent = mockApiResponse.error || 'Registration failed.';
                }
            } else {
                errorMessage.textContent = 'Please fill out all fields correctly.';
            }
        });
    }
});

/**
 * Mock API for user registration
 * Simulates backend behavior for the register endpoint
 */
function mockRegisterApi(email, password) {
    // Simulate duplicate email check
    const existingEmails = ['test@example.com', 'user@example.com'];

    if (existingEmails.includes(email)) {
        return {
            success: false,
            error: 'Email is already registered.',
        };
    }

    // Simulate success response
    return {
        success: true,
        message: 'User registered successfully!',
    };
}
