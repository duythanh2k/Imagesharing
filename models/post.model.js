const db   = require("./db");
const User = require("./user.model");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const Post = db.define(
  "Posts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
  },
  {
    index: [
      {
        name: "index_post",
        fields: ["user_id"],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);
User.hasMany(Post, { foreignKey: "user_id" });
Post.belongsTo(User);
Post.associate = (models) => {
  Post.hasMany(models.Comment, {
    onDelete: "cascade",
  });
}

// Post.sync({ force: false });

module.exports = Post;
