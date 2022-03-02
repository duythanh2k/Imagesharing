const mysql = require('mysql2');
const dbConfig = require('../config/config.json');

const db = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.db
});

module.exports = db.promise();