// const express = require('express');
// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const db = require('./database');

// const app = express();
// app.use(express.static('public'));
// app.use(bodyParser.urlencoded({ extended: true }));

// // Serve registration page
// app.get('/register', (req, res) => {
//     res.sendFile(__dirname + '/views/register.html');
// });

// // Serve login page
// app.get('/login', (req, res) => {
//     res.sendFile(__dirname + '/views/login.html');
// });

// // Register User
// app.post('/register', async (req, res) => {
//     const { username, email, password } = req.body;

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user into the database
//     const query = `INSERT INTO users (username, email, password) VALUES (?, ?)`;
//     db.run(query, [username, email, hashedPassword], (err) => {
//         if (err) {
//             return res.send('Username or email already exists.');
//         }
//         res.send('User registered successfully!');
//     });
// });

// // Login User
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     // Check if user exists
//     const query = `SELECT * FROM users WHERE username = ?`;
//     db.get(query, [username], async (err, user) => {
//         if (err || !user) {
//             return res.send('User not found.');
//         }

//         // Check if password matches
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (isMatch) {
//             res.send('Login successful!');
//         } else {
//             res.send('Incorrect password.');
//         }
//     });
// });

// const PORT = 3000;
// app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = require('./database');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files like HTML, JS, and CSS

// Serve registration page
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register.html');
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

// Register Route
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Insert data into the database (SQL query)
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function(err) {
        if (err) {
            return res.json({ success: false, message: 'Registration failed' });
        }
        res.json({ success: true, message: 'Registration successful' });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Query the database to check user credentials
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err || !row) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
        res.json({ success: true, message: 'Login successful' });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

