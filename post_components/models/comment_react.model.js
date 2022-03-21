const db      = require("../../util/db");
const User    = require("../../user_components/models/user.model");
const Comment = require("./comment.model");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const CommentReact = db.define(
  "CommentReacts",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: User,
        key: "id",
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Comment,
        key: "id",
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  },
  {
    index: [
      {
        name: "index_cmtr1",
        fields: ["user_id"],
      },
      {
        name: "index_cmtr2",
        fields: ["comment_id"],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

// CommentReact.sync({ force: false });

module.exports = CommentReact;
