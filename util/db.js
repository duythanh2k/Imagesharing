const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const db = new Sequelize(
  process.env.DB,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.HOST,
    dialect: "mysql",
  }
);

//  exports.connect=async function(){
//       try {
//             await db.authenticate();
//             console.log('Connection has been established successfully.');
//       } catch (error) {
//             console.error('Unable to connect to the database:', error);
//       }
//   }
module.exports = db;
