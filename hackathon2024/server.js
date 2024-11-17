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

// Serve friends page
app.get('/friends', (req, res) => {
    res.sendFile(__dirname + '/views/friends.html');
  });

// Serve profile page
app.get('/profile', (req, res) => {
    const username = req.cookies.username;

    // Check if the cookie exists
    if (!username) {
        console.log('No cookie found, redirecting to login.');
        return res.redirect('/login');
    } else {
        console.log('Cookie found:', username);
        res.sendFile(__dirname + '/views/profile.html');
    }
  });

// API route to get the username cookie value
app.get('/api/username', (req, res) => {
    const username = req.cookies.username || 'Guest';
    res.json({ username });
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
  const { username, email, password } = req.body;

  if (!email) {
    return res.status(400).send("Email is required.");
  }

  // Check if the email already exists
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error("Error checking email:", err.message);
      return res.status(500).send("Error checking email.");
    }

    if (row) {
      return res.status(400).send("Email already registered.");
    }

    // Proceed with hashing password and inserting user
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send("Error in hashing password.");
      }

      // Insert the user into the database
      db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], function(err) {
        if (err) {
          console.error("Database Insert Error:", err.message);
          return res.status(500).send("Error in registering user.");
        }
        console.log("User inserted successfully");
        res.redirect('/login');
      });
    });
  });
  
//   // Hash the password
//   bcrypt.hash(password, 10, (err, hashedPassword) => {
//     if (err) {
//       return res.status(500).send("Error in hashing password.");
//     }

//     // Insert user into the database
//     db.run("INSERT INTO users (username, email, password) VALUES (?, ?. ?)", [username, email, hashedPassword], function(err) {
//       if (err) {
//         console.error("Error inserting user:", email);
//         return res.status(500).send("Error in registering user.");
//       }
//       res.redirect('/login');
//     });
//   });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) {
      return res.status(401).send("User not found.");
    }
    
    // Set the cookie with options to ensure it's sent correctly
    res.cookie('username', user.username, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'Strict', // Helps with CSRF protection
        secure: false // Set to true if you're using HTTPS
    });

    // Compare the hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).send("Incorrect password.");
      }

      // Create a session (using a simple cookie)
      res.cookie('userId', user.user_id, { maxAge: 86400000 }); // 1 day
      res.redirect('/home');
    });
  });
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('userId');
  res.clearCookie('username');
  res.redirect('/login');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

