const postService = require("../services/post.service");
require("dotenv").config;

exports.getAllCmtDesc = async (req, res) => {
  const postId = req.params.id;
  let comment;
  let message;
  try {
    //Check existence of a post
    const isPostExists = await postService.checkPostExistence(postId);
    if (!isPostExists) {
      message = "Post doesn't exist!"
    } else {
      comment = await postService.getAllCmtDesc(
        req.params.id,
        req.query.sort
      );
      message = null;
    }
    
    return res.json({
      status: "Success",
      code: null,
      message: message,
      data: comment,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

exports.deleteComment = async (req, res) => {
  const postId = req.params.id;
  const commentId = req.params.comment_id;
  try {
    //Check condition where both comment and post are exist
    const isPostExists = await postService.checkPostExistence(postId);
    const isCommentExists = await postService.checkCommentExistence(commentId);
    let message;
    if (!isPostExists) {
      message = "Post doesn't exist!"
    } else {
      if (!isCommentExists) {
        message = "Comment doesn't exist!"
      } else {
        await postService.deleteComment(postId, commentId);
        message = null;
      }
    }

    return res.json({
      status: "Success",
      code: null,
      message: message,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

exports.likeComment = async (req, res) => {
  try {
    let commentId = req.params.comment_id;
    let userId = req.idUser;
    //Check condition where comment exists
    const isCommentExists = await postService.checkCommentExistence(commentId);
    if (!isCommentExists) {
      return res.json({
        status: "Error",
        code: "NOT_EXISTS",
        message: "Comment does not exist!",
        data: null,
      });
    } else {
      let like = await postService.likeComment(userId, commentId);
      if (like != 1) {
        return res.json({
          status: "Success",
          code: null,
          message: "Liked!",
          data: null,
        });
      } else { // Call API again -> another PK generate and it'll return 0 -> Unlike
        return res.json({
          status: "Success",
          code: null,
          message: "Unliked!",
          data: null,
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

