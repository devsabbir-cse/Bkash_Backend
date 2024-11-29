const mysql = require("mysql");

const db = mysql.createConnection({
  host:'localhost',
  user: 'root', // e.g., 'root'
  password: '',
  database: 'agent_transection_history'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to the database.");
});

module.exports = db;

