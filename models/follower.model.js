const db      = require("../util/db");
const User = require("./user.model");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const follower = db.define(
  "followers",
  {
    follower_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    followed_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    timestamps: false,
    underscored: true,
  }
);

follower.sync({ force: false });

module.exports = follower;
