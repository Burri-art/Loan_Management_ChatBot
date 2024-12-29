// database.js
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database (it will be created if it doesn't exist)
const db = new sqlite3.Database('./microfinance.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Function to create tables
const createTables = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount REAL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `, (err) => {
    if (err) {
      console.error('Error creating loans table:', err.message);
    }
  });
};

// Function to insert a new user into the database
const addUser = (name, email, callback) => {
  const query = `INSERT INTO users (name, email) VALUES (?, ?)`;
  db.run(query, [name, email], function(err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, this.lastID); // Return the ID of the inserted user
    }
  });
};

// Function to get user by email
const getUserByEmail = (email, callback) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row); // Return user details if found
    }
  });
};

// Function to apply for a loan
const applyForLoan = (userId, amount, callback) => {
  const query = `INSERT INTO loans (user_id, amount) VALUES (?, ?)`;
  db.run(query, [userId, amount], function(err) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, this.lastID); // Return the ID of the loan
    }
  });
};

// Function to get loans for a specific user
const getLoansByUserId = (userId, callback) => {
  const query = `SELECT * FROM loans WHERE user_id = ?`;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows); // Return all loans associated with the user
    }
  });
};

// Export the functions and the `db` object for use in other parts of the app
module.exports = {
  db,
  createTables,
  addUser,
  getUserByEmail,
  applyForLoan,
  getLoansByUserId
};
