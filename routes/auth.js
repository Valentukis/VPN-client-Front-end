const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const db = require('../config/db'); // Database connection

const router = express.Router();

// POST /auth/register endpoint
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password || password.length < 8) {
        return res.status(400).json({ error: 'Invalid email or password.' });
    }

    try {
        // Check if the email is already registered
        const [existingUser] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user in the database
        await db.execute(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});

module.exports = router;

// POST /auth/login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Step 1: Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        // Step 2: Check if the user exists in the database
        const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            // No user found with the provided email
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const storedPasswordHash = user[0].password_hash;

        // Step 3: Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);

        if (!isPasswordValid) {
            // Password doesn't match
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Step 4: Return success response
        res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});
