const db      = require("../../util/db");
const User    = require("../../user_components/models/user.model");
const Comment = require("./comment.model");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const CommentReact = db.define(
  "CommentReacts",
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

// CommentReact.sync({ force: false });

module.exports = CommentReact;
