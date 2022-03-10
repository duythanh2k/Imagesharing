const postService = require("../services/post.service");
require("dotenv").config;

exports.getAllCmtDesc = async (req, res) => {
  try {
    let results = await postService.getAllCmtDesc(
      req.params.id,
      req.query.sort
    );
    
    return res.json({
      status: "Success",
      code: null,
      message: results.message,
      data: results.comment,
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
    let results = await postService.deleteComment(
      req.params.id, 
      req.params.comment_id
    );

    return res.json({
      status: "Success",
      code: null,
      message: results,
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
    let results = await postService.likeComment(req.idUser, req.params.comment_id);
    return res.json({
      status: "Success",
      code: null,
      message: results,
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

