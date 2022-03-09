const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const CommentReact = require("../models/comment_react.model");

// Get all comments of a post sort by timestamp
exports.getAllCmtDesc = async (id, sort) => {
  try {
    // First we gonna find a post by id that we wanna see it's comments
    let post = await Post.findOne({ where: { id: id } });
    const ordered = [];

    if (!post) {
      // Condition where that post does not found
      return null;
    } else {
      // query for sort comment by descend timestamp
      if (sort === "-created") {
        ordered.push(["created_at", "DESC"]);
      }
      // find all comments of current post and sort comments by lateset timestamp
      let comment = await Comment.findAll({
        where: {
          post_id: post.id,
        },
        // Order condition
        order: ordered,
      });
      return comment;
    }
  } catch (err) {
    throw err;
  }
};

// Delete a comments of a post
exports.deleteComment = async (post_id, comment_id) => {
  try {
      // find a comment and delete
    await Comment.destroy({
      where: {
        id: comment_id,
        post_id: post_id,
      },
    });
  } catch (err) {
    throw err;
  }
};

exports.likeComment = async (user_id, comment_id) => {
  try {
    // Create a new like
    let like = await CommentReact.create({
      user_id,
      comment_id,
    });
    return like;
  } catch (err) {
    // Destroy like when call twice
    let like = await CommentReact.destroy({
      where: {
        user_id,
        comment_id,
      },
    });
    return like;
  }
};


// Functions check existence
exports.checkPostExistence = async (id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(id)) {
      const post = await Post.findByPk(id);
      return post;
    }
  } catch (error) {
    return error;
  }
};
exports.checkCommentExistence = async (id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(id)) {
      const comment = await Comment.findByPk(id);
      return comment;
    }
  } catch (error) {
    return error;
  }
};
