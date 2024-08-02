const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

console.log("Attempting to connect to the database with the following config:");

const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  } else {
    console.log("Successfully connected to the database");
  }
});

app.use(express.json());

app.post("/getUserInfo", (req, res) => {
  const { qrData } = req.body;
  const query = "SELECT * FROM data WHERE `UPI_Ref_No` = ?";
  connection.query(query, [qrData], (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).send("Database query error");
    }
    if (results.length === 0) {
      return res.status(404).send("User not found");
    }
    const user = results[0];
    if (user.Checked_In == 1) {
      return res.status(409).send("User has already checked in");
    }
    if (user["Last_name"] == null) {
      const userInfo = {
        fullName: `${user["First_name"]}`.toUpperCase(),
        email: user["Email"].toLowerCase(),
        phoneNumber: user["Phone_Number"],
      };
      res.json(userInfo);
    } else {
      const userInfo = {
        fullName: `${user["First_name"]} ${user["Last_name"]}`.toUpperCase(),
        email: user["Email"].toLowerCase(),
        phoneNumber: user["Phone_Number"],
      };
      res.json(userInfo);
    }
  });
});

app.post("/checkInUser", (req, res) => {
  const { qrData } = req.body;
  const query = "UPDATE data SET Checked_In = 1 WHERE `UPI_Ref_No` = ?";
  connection.query(query, [qrData], (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res.status(500).send("Database query error");
    }
    res.send("User checked in successfully");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
