
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const db = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { get } = require('http');
const app = express();

// Set up multer to store files as buffers (no disk storage)
const storage = multer.memoryStorage();  // This stores the files as buffers in memory
const upload = multer({ storage: storage });

// Middleware
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

app.get('/edit-profile', (req, res) => {
    const username = req.cookies.username;

    // Check if the cookie exists
    if (!username) {
        return res.redirect('/login');
    } else {
        res.sendFile(__dirname + '/views/edit-profile.html');
    }
  });

// Route to handle profile edits
app.post('/edit-profile', (req, res) => {
    const { bio } = req.body;
    const userId = req.cookies.userId;
  
    if (!userId) {
      return res.status(403).send('Not logged in');
    }
  
    // Update the user in the database
    db.run(
      'UPDATE users SET bio = ? WHERE user_id = ?',
      [bio],
      function (err) {
        if (err) {
          return res.status(500).send('Failed to update profile');
        }
  
        // Update the cookies with the new information
        
        res.cookie('bio', bio);
        res.redirect('/profile');
      }
    );
  });

// API route to get the username cookie value
app.get('/api/username', (req, res) => {
    const username = req.cookies.username || 'Guest';
    res.json({ username });
});

// API route to get the bio cookie value
app.get('/api/bio', (req, res) => {
    const bio = req.cookies.bio || 'This is a bio';
    res.json({ bio });
});

// Serve home page (after successful login/registration)
app.get('/home', (req, res) => {
  if (!req.cookies.userId) {
    return res.redirect('/login');
  }
  res.sendFile(__dirname + '/views/home.html');
});

// Create post page (fixed to correctly fetch the theme)
app.get('/createpost', (req, res) => {
  if (!req.cookies.userId) {
    return res.redirect('/login');
  }

  // Query to get the current theme from the database
  db.get("SELECT theme FROM daily_theme WHERE id = 1", (err, row) => {
    if (err) {
      console.error("Error fetching theme from database:", err);
      return res.redirect('/home'); // Handle errors gracefully
    }

    // If no theme is found (which should not happen), default to 'Default Theme'
    const theme = row ? row.theme : 'Default Theme';

    // Now send the create post page with the current theme
    res.sendFile(__dirname + '/views/createpost.html', {
      theme: theme
    });
  });
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
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

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

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(401).send("Incorrect password.");
      }

      // Create a session (using a simple cookie)
      res.cookie('userId', user.user_id, { maxAge: 86400000, httpOnly: true }); // 1 day
      res.cookie('bio', user.bio, { maxAge: 86400000, httpOnly: true });
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

// Create post route (with file upload and store binary data in the database)
app.post('/create-post', upload.single('photo'), (req, res) => {
  const { theme, description } = req.body;

  let photo = null;
  if (req.file) {
    try {
      // Store the file buffer (binary data) directly in the database
      photo = req.file.buffer;
    } catch (error) {
      console.error("Error processing file:", error);
      return res.status(500).send("Error processing uploaded file.");
    }
  } else {
    console.warn("No file uploaded.");
  }

  const postDescription = description || null;

  // Insert post into the database, store the binary data of the photo
  db.run("INSERT INTO posts (user_id, photo, theme, overall_rating) VALUES (?, ?, ?, ?)", 
    [req.cookies.userId, photo, theme, 0], function(err) {
      if (err) {
        console.error("Database insertion error:", err);
        return res.status(500).send("Error creating post.");
      }
      res.redirect('/home');
  });
});

// Serve specific post
app.get('/post/:postId', (req, res) => {
  const postId = req.params.postId;

  // Query to get the post data from the database, including the photo (binary data)
  db.get('SELECT photo, user_id, theme FROM posts WHERE post_id = ?', [postId], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Error retrieving post.");
    }

    if (!row) {
      return res.status(404).send("Post not found.");
    }

    // Fetching the user's profile info based on user_id
    db.get('SELECT username FROM users WHERE user_id = ?', [row.user_id], (err, user) => {
      if (err || !user) {
        console.error("Error fetching user data:", err.message);
        return res.status(500).send("Error retrieving user data.");
      }

      // HTML with dynamic content
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Post Page</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
              }
              .post-container {
                width: 100%;
                max-width: 600px;
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .post-header {
                text-align: center;
                font-size: 1.5em;
                font-weight: bold;
                margin-bottom: 20px;
              }
              .user-info {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
              }
              .profile-pic {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                object-fit: cover;
                margin-right: 15px;
              }
              .username {
                font-size: 1.2em;
                color: #333;
                text-decoration: none;
              }
              .username:hover {
                color: #007bff;
              }
              .post-photo {
                width: 100%;
                height: auto;
                margin-bottom: 15px;
                border-radius: 10px;
              }
              .rating-container {
                text-align: center;
                margin-top: 15px;
              }
              .star {
                font-size: 2em;
                color: #ccc;
                cursor: pointer;
              }
              .star:hover,
              .star.selected {
                color: #ffcc00;
              }
            </style>
          </head>
          <body>
            <div class="post-container">
              <div class="post-header">${row.theme}</div>
              <div class="user-info">
                <img src="https://via.placeholder.com/50" alt="Profile Picture" class="profile-pic" />
                <a href="#" class="username">${user.username}</a>
              </div>
              <img src="data:image/jpeg;base64,${row.photo.toString('base64')}" alt="Post Photo" class="post-photo" />
              <div class="rating-container">
                <span class="star" data-rating="1">&#9733;</span>
                <span class="star" data-rating="2">&#9733;</span>
                <span class="star" data-rating="3">&#9733;</span>
                <span class="star" data-rating="4">&#9733;</span>
                <span class="star" data-rating="5">&#9733;</span>
              </div>
            </div>
            <script>
              const stars = document.querySelectorAll(".star");
              stars.forEach((star) => {
                star.addEventListener("click", () => {
                  stars.forEach((s) => s.classList.remove("selected"));
                  star.classList.add("selected");
                  let rating = star.getAttribute("data-rating");
                  alert(\You rated this post \${rating} star(s)!\);
                });
                star.addEventListener("mouseover", () => {
                  stars.forEach((s) => (s.style.color = "#ccc"));
                  for (let i = 0; i < star.dataset.rating; i++) {
                    stars[i].style.color = "#ffcc00";
                  }
                });
                star.addEventListener("mouseout", () => {
                  stars.forEach(
                    (s) =>
                      (s.style.color = s.classList.contains("selected")
                        ? "#ffcc00"
                        : "#ccc")
                  );
                });
              });
            </script>
          </body>
        </html>
      `;

      // Send the HTML to the client
      res.send(html);
    });
  });
});


// Update the cron job to set the theme cookie
// This runs every minute for testing purposes
// Change to run daily when submitting ///////////////////////////////////////////////////////////////
cron.schedule('*/1 * * * *', () => { 
  const themes = [
    'Scenic', 'Portrait', 'Abstract', 'Negative Space', 'Minimalism', 'Surrealism', 'Street Photography',
    'Monochrome', 'Macro Photography', 'Bokeh Effect', 'Silhouette', 'Reflection', 'Motion Blur',
    'Golden Hour', 'High Key', 'Low Key', 'Rule of Thirds', 'Perspective', 'Geometric Patterns', 'Double Exposure',
    'Texture', 'Still Life', 'Landscape', 'Fashion', 'Wildlife', 'Candid', 'HDR (High Dynamic Range)', 
    'Light and Shadows', 'Leading Lines', 'Symmetry', 'Depth of Field', 'Long Exposure', 'Mood and Emotion', 
    'Architecture', 'Color Blocking', 'Nature and Wildlife', 'Urban Exploration'
  ];

  const newTheme = themes[Math.floor(Math.random() * themes.length)];
  const currentTime = new Date().toISOString();

  db.run(
    "INSERT OR REPLACE INTO daily_theme (id, theme, last_updated) VALUES (1, ?, ?)",
    [newTheme, currentTime],
    (err) => {
      if (err) {
        console.error("Error updating theme in cron job:", err);
      } else {
        console.log(`Theme updated to '${newTheme}' at ${currentTime}`);

        // After updating the theme in the database, set the cookie
        app.use((req, res, next) => {
          res.cookie('theme', newTheme, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'Strict',
            secure: false // Use `true` if your app is served over HTTPS
          });
          next();
        });
      }
    }
  );
});

// API route to get the theme from the database
app.get('/api/theme', (req, res) => {
  db.get("SELECT theme FROM daily_theme WHERE id = 1", (err, row) => {
    if (err) {
      console.error("Error fetching theme from database:", err);
      return res.status(500).json({ error: 'Error fetching theme' });
    }

    const theme = row ? row.theme : 'Default Theme';
    res.json({ theme: theme });
  });
});


// Start the server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});