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

router.get('/test', (req, res) => {
    res.json({ message: 'Test route is working!' });
});

module.exports = router;
