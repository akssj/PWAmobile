import mysql from "mysql2";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "react_crud",
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database");
});

export { connection };
