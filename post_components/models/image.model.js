const db   = require("../../util/db");
const Post = require("./post.model");
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const Image = db.define(
  "Images",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    caption: {
      type: DataTypes.TEXT,
    },
    link_origin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link_thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link_post: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.TEXT,
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
        name: "index_image",
        fields: ["post_id"],
      },
    ],
    timestamps: false,
    underscored: true,
  }
);

Post.hasMany(Image, { foreignKey: "post_id" });
Image.belongsTo(Post);

// Image.sync({ force: false });

module.exports = Image;
