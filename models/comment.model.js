const db   = require("./db");
const User = require("./user.model");
const Post = require("./post.model");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const Comment = db.define(
  "Comments",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    parent_cmt_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  },
  {
    index: [
      {
        name: "index_cmt1",
        fields: ["user_id"],
      },
      {
        name: "index_cmt2",
        fields: ["post_id"],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

Post.hasMany(Comment, { foreignKey: "post_id" });
Comment.belongsTo(Post, { foreignKey: "user_id" });
User.hasMany(Comment, { foreignKey: "user_id" });
Comment.belongsTo(User);

// Comment.sync({ force: false });

module.exports = Comment;
