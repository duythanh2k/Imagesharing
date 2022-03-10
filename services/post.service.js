const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const CommentReact = require("../models/comment_react.model");

// Get all comments of a post sort by timestamp
exports.getAllCmtDesc = async (id, sort) => {
  try {
    const ordered = [];
    let message, comment;
    // query for sort comment by descend timestamp
    if (sort === "-created") {
      ordered.push(["created_at", "DESC"]);
    }

    let isPostExists = await checkPostExistence(id);
    // Check if there is a post in database
    if (!isPostExists) {
      message = "Post does not exist!";
      comment = null;
      return { message, comment };
    } else {
      message = null;
        // find all comments of current post and sort comments by lateset timestamp
      comment = await Comment.findAll({
        where: {
          post_id: id,
        },
        // Order condition
        order: ordered,
      });
      return { message, comment };
    }

  } catch (err) {
    throw err;
  }
};

// Delete a comments of a post
exports.deleteComment = async (post_id, comment_id) => {
  try {
    let isPostExists = await checkPostExistence(post_id);
    let isCommentExists = await checkCommentExistence(comment_id);
    let message
    // Check if there is a post in database
    if (!isPostExists) {
      message = "Post does not exist!";
      return message;
    } else {
      // Check if there is a comment in database
      if (!isCommentExists) {
        message = "Comment does not exist!";
        return message;
      } else {
        // find a comment and delete
        await Comment.destroy({
          where: {
            id: comment_id,
            post_id: post_id,
          },
        });
        return null;
      }
    }
  } catch (err) {
    throw err;
  }
};

exports.likeComment = async (user_id, comment_id) => {
  try {
    let isCommentExists = await checkCommentExistence(comment_id);
    let message;
    // Check if there is a comment in database
    if (!isCommentExists) {
      message = "Comment does not exist!";
      return message;
    } else {
      message = "Liked!";
      // Create a new like
      await CommentReact.create({
        user_id,
        comment_id,
      });
      return message;
    }
  } catch (err) { // Call API again with the same user_id and comment_id will cause error
    let message = "Unliked!";
    // Destroy like when call twice
    await CommentReact.destroy({
      where: {
        user_id,
        comment_id,
      },
    });
    return message;
  }
};


// Functions check existence
const  checkPostExistence = async (id) => {
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
const checkCommentExistence = async (id) => {
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
