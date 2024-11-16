const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (creates the file if it doesn't exist)
const db = new sqlite3.Database('./hackathon.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // Create "users" table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            pfp BLOB,
            bio TEXT,
            streak INTEGER
        )`, (err) => {
            if (err) console.error('Error creating users table:', err.message);
        });

        // Create "posts" table
        db.run(`CREATE TABLE IF NOT EXISTS posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            photo BLOB,
            theme TEXT,
            overall_rating INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )`, (err) => {
            if (err) console.error('Error creating posts table:', err.message);
        });

        // Create "friends_list" table
        db.run(`CREATE TABLE IF NOT EXISTS friends_list (
            friends_list_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER,
            user2_id INTEGER,
            FOREIGN KEY (user1_id) REFERENCES users(user_id),
            FOREIGN KEY (user2_id) REFERENCES users(user_id)
        )`, (err) => {
            if (err) console.error('Error creating friends_list table:', err.message);
        });

        // Create "individual_rating" table
        db.run(`CREATE TABLE IF NOT EXISTS individual_rating (
            individual_rating_id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            user_id INTEGER,
            rating INTEGER,
            comment TEXT,
            FOREIGN KEY (post_id) REFERENCES posts(post_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )`, (err) => {
            if (err) console.error('Error creating individual_rating table:', err.message);
        });

        // Create "fave_posts" table
        db.run(`CREATE TABLE IF NOT EXISTS fave_posts (
            fave_post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            post1_id INTEGER,
            post2_id INTEGER,
            post3_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (post1_id) REFERENCES posts(post_id),
            FOREIGN KEY (post2_id) REFERENCES posts(post_id),
            FOREIGN KEY (post3_id) REFERENCES posts(post_id)
        )`, (err) => {
            if (err) console.error('Error creating fave_posts table:', err.message);
        });

        

        console.log('All tables created successfully.');
    }
});

module.exports = db;
