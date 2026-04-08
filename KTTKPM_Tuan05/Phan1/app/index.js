const express = require("express");
const mysql = require("mysql2");

const app = express();

const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "root",
  database: "testdb",
});

db.connect(err => {
  if (err) {
    console.log("DB connection failed:", err);
  } else {
    console.log("Connected to MySQL!");
  }
});

app.get("/", (req, res) => {
  res.send("Hello Docker Compose 🚀");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});