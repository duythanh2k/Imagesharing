const db      = require("../../util/db");
const User = require("./user.model");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const follower = db.define(
  "Followers",
  {
    follower_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    followed_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
  },
  {
    timestamps: false,
    underscored: true,
  }
);

// follower.sync({ force: false });

module.exports = follower;
