const mysql = require('mysql2');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Celsius1623!',
    database: 'employee'
  });

  module.exports = db;