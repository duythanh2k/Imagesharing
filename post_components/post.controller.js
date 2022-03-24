const postService = require("./post.service");

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

exports.getAllCmt = async (req, res) => {
  try {
    let postId = req.params.id;
    let requests = req.query;
    let results = await postService.getAllCmt(postId, requests);
    return res.json({
      status: "Success",
      code: null,
      message: null,
      data: results,
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

exports.updateComment = async (req, res) => {
  const post_id = req.params.id;
  const comment_id = req.params.comment_id;
  const user_id = req.idUser;
  let newText = req.body.text;
  try {
    let updatedComment = await postService.updateComment(
      user_id, post_id, 
      comment_id, newText
    );

    return res.json({
      status: "Success",
      code: null,
      message: null,
      data: updatedComment,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
}

exports.deleteComment = async (req, res) => {
  const post_id = req.params.id;
  const comment_id = req.params.comment_id;
  const user_id = req.idUser;
  try {
    await postService.deleteComment(
      user_id,
      post_id, 
      comment_id
    );

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

exports.likeComment = async (req, res) => {
  const post_id = req.params.id;
  const comment_id = req.params.comment_id;
  const user_id = req.idUser;
  try {
    let results = await postService.likeComment(
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


exports.uploadLink = async(req, res, next)=>{
  try {
  let numberImage = Number.parseInt(req.query.numberOfImage);
  const result = await postService.generateUploadUrl(numberImage);
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
}

exports.uploadPost = async (req, res, next) => {
try {
  const description = req.body.description;
  const image = req.body.images_arr;
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
  const post_id = req.params.id;
  const user_id = req.idUser;
  try {
    let result = await postService.likePost(user_id, post_id);
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

exports.createComment = async (req, res) => {
  let data = {
    text: req.body.text,
    parent_comment_id: req.params.comment_id,
    user_id: req.idUser,
    post_id: req.params.id
  }
  try {
    await postService.createComment(data);
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
    const paging =req.query
    let result = await postService.listPost(idUser, paging);
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
    const image = req.body.images_arr;
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
