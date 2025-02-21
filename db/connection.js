const mysql = require("mysql");

const db = mysql.createConnection({
  host:'fdb28.awardspace.net',
  user: '4592095_bkash', // e.g., 'root'
  password: '?LCsm2m3L8EfK65',
  database: '4592095_bkash',
  connectTimeout: 20000
  // host:'localhost',
  // user: 'root', // e.g., 'root'
  // password: '',
  // database: 'Bkash'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database.");
});

module.exports = db;
