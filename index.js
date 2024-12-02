const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Adjust path if necessary

const app = express();

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});


// Middleware
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes); // Adds /auth/register to your backend

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
