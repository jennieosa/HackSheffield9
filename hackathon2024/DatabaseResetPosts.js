// DELETE THIS FILE AFTER POSTS IS FINISHED EDITING
const sqlite3 = require ('sqlite3').verbose ();

// Connect to the SQLite database
const db = new sqlite3.Database('./hackathon.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);

} else { console.log('Connected to SQLite database.');

} });

// Reset the posts table
db.serialize(() => {
    // Delete all rows from the posts table
    db.run('DELETE FROM posts;', (err) => {
        if (err) {
            console.error('Error deleting rows from posts table:', err.message);

        } else {
            console.log('All rows deleted from posts table.');

} });

    // Reset the auto-increment counter for the posts table
    db.run('DELETE FROM sqlite_sequence WHERE name="posts";', (err) => {
        if (err) {
            console.error('Error resetting auto-increment counter:', err.message);

        } else {
            console.log('Auto-increment counter reset for posts table.');

} });

});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);

} else { console.log('Database connection closed.');

} });