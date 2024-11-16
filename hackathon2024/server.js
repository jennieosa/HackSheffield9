const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const db = require('./database');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// Serve registration page
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/views/register.html');
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

// Serve home page (after successful login/registration)
app.get('/home', (req, res) => {
  // Check if the user is logged in by checking the session or cookie
  if (!req.cookies.userId) {
    return res.redirect('/login');
  }
  res.sendFile(__dirname + '/views/home.html');
});

// Registration route
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send("Error in hashing password.");
    }

    // Insert user into the database
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
      if (err) {
        return res.status(500).send("Error in registering user.");
      }
      res.redirect('/login');
    });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      return res.status(401).send("User not found.");
    }

    // Compare the hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).send("Incorrect password.");
      }

      // Create a session (using a simple cookie)
      res.cookie('userId', user.id, { maxAge: 86400000 }); // 1 day
      res.redirect('/home');
    });
  });
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/login');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

