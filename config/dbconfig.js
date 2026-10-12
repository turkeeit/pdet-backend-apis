const mysql = require("mysql");
require("dotenv").config();

console.log(process.env.db_host);
const connection = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_name,
});

connection.connect((err) => {
  if (err) {
    console.log("Error in connecting to database ..", err);
    return;
  }
  console.log("Connected to mysql server");
});

// connection.end();

module.exports = connection;
