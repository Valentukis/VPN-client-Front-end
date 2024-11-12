// database.js
const mysql = require('mysql2');

// Create a pool connection to the MySQL database
const pool = mysql.createPool({
    host: 'localhost', // MySQL server is running locally
    user: 'root', // Replace with your MySQL username
    password: 'bangerSquad555', // Replace with your MySQL root password
    database: 'login_system', // The database you created
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the promise-based pool
module.exports = pool.promise();
