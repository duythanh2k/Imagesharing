const db      = require("../../util/db");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const Notification = db.define(
  "Notifications",
  {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false 
    },
    recipient: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type:{
      type: DataTypes.BOOLEAN,
      allowNull:false,
    },
    type_id:{
      type: DataTypes.INTEGER,
      allowNull:false,
    },
  },
  {
    timestamps: false,
    underscored: true,
  }
);

// Notification.sync({ force: false });

module.exports = Notification;
