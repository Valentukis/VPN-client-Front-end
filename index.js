const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Adjust path if necessary

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes); // Adds /auth/register to your backend

// Start the server
const PORT = process.env.PORT || '3000';
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});