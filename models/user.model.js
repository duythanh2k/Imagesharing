const db = require("../util/db");
const { Sequelize, DataTypes, Deferrable, Model } = require("sequelize");

const User = db.define(
  "Users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
    underscored: true,
  }
);

// synchronize with database
// if (force: true)
//      each time you connect to db, recreate a new table and lose all the information before
// if (force: false)
//      tables will not be create again
// User.sync({ force: false });

module.exports = User;
