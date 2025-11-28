// db/config.js
import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",        // change if needed
  password: "root",        // your MySQL password
  database: "hospital_db" // your DB name
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL Connected...");
  }
});

export default connection; // 👈 VERY IMPORTANT
