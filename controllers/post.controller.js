const postService = require("../services/post.service");

//Lấy tất cả các ảnh của cá nhân
exports.getAllImageUser = async (req, res, next) => {
    try {
      let idUser = req.idUser;
      let requests = req.query;
      let result = await postService.getAllImageUser(idUser, requests);
      return res.json({
        status: "Success",
        code: null,
        message: null,
        data: result,
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
  
//Cập nhật caption của ảnh
exports.updateCapImage = async (req, res, next) => {
    try {
      let idImage = req.params.id;
      let newcapIamge = req.body.caption;
      let idUser = req.idUser;
      await postService.updateCapImage(idImage,idUser, newcapIamge);
      return res.json({
        status: "Success",
        code: null,
        message: null,
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
  
//Xóa ảnh
exports.deleteImage = async (req, res, next) => {
    try {
      let idImage = req.params.id;
      let idUser = req.idUser;
      await postService.deleteImage(idUser,idImage);
      return res.json({
        status: "Success",
        code: null,
        message: null,
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
  

exports.getAllCmtDesc = async (req, res) => {
  try {
    let postId = req.params.id;
    let requests = req.query;
    let results = await postService.getAllCmtDesc(
      postId,
      requests
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
  const post_id = req.params.id;
  const comment_id = req.params.comment_id;
  const user_id = req.idUser;
  try {
    let results = await postService.deleteComment(
      user_id,
      post_id, 
      comment_id
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

