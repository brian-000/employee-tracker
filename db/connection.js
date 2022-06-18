const mysql = require('mysql2');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee'
  });

  module.exports = db;