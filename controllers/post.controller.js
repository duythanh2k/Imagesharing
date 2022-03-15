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
    await postService.updateCapImage(idImage, idUser, newcapIamge);
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
    await postService.deleteImage(idUser, idImage);
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
    let results = await postService.getAllCmtDesc(postId, requests);

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
    let results = await postService.deleteComment(user_id, post_id, comment_id);

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
    let results = await postService.likeComment(
      req.idUser,
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
exports.uploadImage = async (req, res, next) => {
  try {
    let numberImage = Number.parseInt(req.query.numberOfImage);
    if (req.files.length === numberImage) {
      pictures = req.files.map((file) => {
        return file["path"];
      });
    }else{
      throw new Error('Please select image');
    }
    let result = await postService.uploadImage(numberImage, pictures);
    res.status(200).json({
      status: "Success",
      code: null,
      message: null,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "Error",
      code: error.code,
      message: error.message,
      data: null,
    });
  }
};

exports.uploadPost = async (req, res, next) => {
  try {
    const description = req.body.description;
    const image = [];
    image.push({
      caption: req.body.caption,
      uploadToken: req.body.token,
    });
    let result = await postService.uploadPost(description, image, req.idUser);
    res.status(200).json({
      status: "Success",
      code: null,
      message: null,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "Error",
      code: error.code,
      message: error.message,
      data: null,
    });
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let result = await postService.likePost(postId, req.idUser);
    res.status(200).json({
      status: "success",
      code: null,
      message: result,
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "Erorr",
      code: error.code,
      message: error.message,
      data: null,
    });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cmt = {
      comment: req.body.comment,
      parentComment: Number.parseInt(req.body.parentCommentId),
    };
    let result = await postService.commentPost(cmt, postId, req.idUser);
    res.status(200).json({
      status: "success",
      code: null,
      message: null,
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "Erorr",
      code: error.code,
      message: error.message,
      data: null,
    });
  }
};
exports.listPost = async (req, res, next) => {
  try {
    const idUser = req.params.id;
    const sort = req.query.sort;
    const paging = {
      limit: req.query.limit,
      offset: req.query.offset,
    };
    let result = await postService.listPost(idUser, sort, paging);
    res.status(200).json({
      status: "success",
      code: null,
      message: null,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "Erorr",
      code: error.code,
      message: error.message,
      data: null,
    });
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const description = req.body.description;
    const image = [];
    image.push({
      caption: req.body.caption,
      uploadToken: req.body.token,
    });
    let result = await postService.updatePost(
      postId,
      description,
      image,
      req.idUser
    );
    res.status(200).json({
      status: "success",
      code: null,
      message: null,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "Erorr",
      code: error.code,
      message: error.message,
      data: null,
    });
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let result = await postService.deletePost(postId, req.idUser);
    res.status(200).json({
      status: "success",
      code: null,
      message: result,
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "Erorr",
      code: error.code,
      message: error.message,
      data: null,
    });
  }
};
