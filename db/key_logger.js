import mysql from "mysql2/promise";

// Database connection settings
const dbConfig = {

  host:'fdb28.awardspace.net',
  user: '4592095_bkash', // e.g., 'root'
  password: '?LCsm2m3L8EfK65',
  database: '4592095_bkash'
 
    // host:'localhost',
    // user: 'root', // e.g., 'root'
    // password: '',
    // database: 'Bkash'
};

export async function getDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
}
