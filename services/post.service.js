const Post           = require("../models/post.model");
const PostReact      = require("../models/post_react.model");
const Comment        = require("../models/comment.model");
const CommentReact   = require("../models/comment_react.model");
const Image          = require("../models/image.model");
const jwt            = require("jsonwebtoken");
const { Sequelize, QueryTypes } = require("sequelize");


//Lấy tất cả các ảnh của user login
exports.getAllImageUser = async (idUser, requests) => {
    try {
      //Kiểm tra dữ liệu nhập vào có trống hay không, nếu trống thì set default
      if(isEmpty(requests.limit)){
        requests.limit=20;
      }
      if(isEmpty(requests.offset)){
        requests.offset=0;
      }
      if(isEmpty(requests.sort_by)){
        requests.sort_by='created_at';
      }
      if(isEmpty(requests.order_by)){
        requests.order_by='DESC';
      }
      let result=await Image.findAll({
          attributes:['id','path','caption'],
          include:
          [{  model:Post,
              attributes:['created_at'],
              required:true,
              where:{
                  user_id:idUser,
              },
              order:[
                [requests.sort_by,requests.order_by]
              ]
          }],
          order:[
            [Sequelize.col(requests.sort_by),requests.order_by]
          ],
          limit: Number(requests.limit),
          offset: Number(requests.offset)
           });
      return result;
    } catch (err) {
      throw err;
    }
  };
  
  //Cập nhật caption mới cho image
  exports.updateCapImage = async (idImage,idUser,newCaption) => {
    try {
      //Kiểm tra image có tồn tại hay không
      let check = await Image.findOne({ where: { id : idImage } });
      if(!check){
        let err = {
          code: "NOT_FOUND",
          message: "Can not found your images",
        };
        throw err;
      }
      // Kiểm tra caption có undefined hay không
      if (newCaption===undefined){
        let err = {
          code: "INVALID_INPUT",
          message: "Input data is invalid",
        };
        throw err;
      }
      let checkOwner=await Image.findAll({
            where: { id:idImage },
            include:
            [{  model:Post,
                required:true,
                where: {id:idUser}
            }],
        });
        //Kiểm tra ảnh có phải của tk đang login
      if(checkOwner.length===0){
        let err = {
            code: "NOT_PERMISSON",
            message: "You don't have permission",
          };
          throw err;
      }  
      await Image.update(
        {
          caption: newCaption,
        },
        {
          where: { id: idImage },
        });
      return;
    } catch (err) {
      throw err;
    }
  }

//Xóa image
exports.deleteImage = async (idUser, idImage) => {
  try {
    //Kiểm tra image có tồn tại hay không
    let check = await Image.findOne({ where: { id: idImage } });
    if (!check) {
      let err = {
        code: "NOT_FOUND",
        message: "Can not found your images",
      };
      throw err;
    }
    let checkOwner = await Image.findAll({
      where: { id: idImage },
      include: [
        {
          model: Post,
          required: true,
          where: {
            user_id: idUser,
          },
        },
      ],
    });
    //Kiểm tra ảnh có phải của tk đang login
    if (checkOwner.length === 0) {
      let err = {
        code: "NOT_PERMISSON",
        message: "You don't have permission",
      };
      throw err;
    }
    await Image.destroy({
      where: { id: idImage },
    });
    return;
  } catch (err) {
    throw err;
  }
};

// Get all comments of a post sort by timestamp
exports.getAllCmtDesc = async (post_id, requests) => {
  try {
    const ordered = [];
    // query for sort comment by descend timestamp
    if (requests.sort === "-created") {
      ordered.push(["created_at", "DESC"]);
    }
    if (isEmpty(requests.limit) || isEmpty(requests.offset)) {
      requests.offset = 0;
      requests.limit = 2;
    }

    let isPostExists = await checkPostExistence(id);
    // Check if there is a post in database
    if (!isPostExists) {
      let err = {
        code: "NOT_FOUND",
        message: "Post not found!",
      };
      throw err;
    }
      // find all comments of current post and sort comments by lateset timestamp
    let comment = await Comment.findAll({
      where: {
        post_id,
      },
      // Order condition
      order: ordered,
      offset: Number(requests.offset),
      limit: Number(requests.limit),
    });
    return comment;
  } catch (err) {
    throw err;
  }
};

// Delete a comments of a post
exports.deleteComment = async (user_id, post_id, comment_id) => {
  try {
    let isPostExists = await checkPostExistence(post_id);
    let isCommentExists = await checkCommentExistence(comment_id);
    let isOwn = await checkCommentOwnership(comment_id, user_id);
    let isCommentOfPost = await checkCommentExistsInPost(comment_id, post_id);
    
    // Check if there is a post in database
    // then Check if there is a comment in database
    // then Check if the current user own this comment
    // then Find a comment and delete
    if (!isPostExists) {
      let err = {
        code: "NOT_FOUND",
        message: "Post not found!",
      };
      throw err;
    }
    if (!isCommentExists) {
      let err = {
        code: "NOT_FOUND",
        message: "Comment not found!",
      };
      throw err;
    }
    if (!isCommentOfPost) {
      let err = {
        code: "NOT_FOUND",
        message: "Comment does not exists in this post!",
      };
      throw err;
    }
    if (!isOwn) {
      let err = {
        code: "NOT_PERMISSON",
        message: "You don't have permission",
      };
      throw err;
    }
    await Comment.destroy({
      where: {
        id: comment_id,
        post_id,
      },
    });
    return;
  } catch (err) {
    throw err;
  }
};

exports.likeComment = async (user_id, comment_id) => {
  try {
    let isCommentExists = await checkCommentExistence(comment_id);
    let alreadyLiked = await checkCommentReactExistence(user_id, comment_id);
    let message;
    // Check if there is a comment in database
    if (!isCommentExists) {
      let err = {
        code: "NOT_FOUND",
        message: "Comment not found!",
      };
      throw err;
    }
    if (alreadyLiked) {
      message = "Unliked!";
      // Destroy like when call twice
      await CommentReact.destroy({
        where: {
          user_id,
          comment_id,
        },
      });
      return message;
    }
    message = "Liked!";
    // Create a new like
    await CommentReact.create({
      user_id,
      comment_id,
    });
    return message;
  } catch (err) {
    // Call API again with the same user_id and comment_id will cause error
    throw err;
  }
};


exports.uploadImage = async (numberImage, image) => {
  if (typeof numberImage !== "number")
    throw new Error("ERROR_CODE.INVALID_INPUT");
  let arrayImage = [numberImage];
  for (var i = 0; i < numberImage; i++) {
    arrayImage[i] = {
      uploadLink: "link" + (i + 1),
      uploadToken: jwt.sign("" + image[i], process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
      }),
    };
  }
  return arrayImage;
};


exports.uploadPost = async (description, image, id) => {
  try {
    if (typeof description !== "string")
      throw new Error("ERROR_CODE.INVALID_INPUT");
    if (!checkEmpty(description)) throw new Error("ERROR_CODE.INVALID_INPUT");
    let arrayImage = [];
    for (var i = 0; i < image[0].uploadToken.length; i++) {
      let path = jwt.verify(
        image[0].uploadToken[i],
        process.env.ACCESS_TOKEN_SECRET
      );
      arrayImage.push({
        caption: image[0]["caption"][i],
        path: path,
      });
    }
    console.log(arrayImage);
    const dataPost = {
      description: description,
      created_at: Date.now(),
      user_id: id,
    };
    let post = await Post.create(dataPost);
    let post_id = post.dataValues.id;
    console.log(post_id);
    for (var i = 0; i < arrayImage.length; i++) {
      await Image.create({
        caption: arrayImage[i]["caption"],
        path: arrayImage[i]["path"],
        post_id: post_id,       
      });
    };
    const result = {
      description: description,
      image: arrayImage,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

exports.likePost = async (post_id, user_id) => {
  try {
    let isPostExist = await checkPostExist(post_id);
    if (!isPostExist) {
      let message = "Post is not exist";
      return message;
    }
    const data = {
      post_id: post_id,
      user_id: user_id,
    };
    let checkId = data.post_id;
    let like = await Post_react.findOne({
      where: {
        post_id: checkId,
        user_id,
      },
    });
    if (!like) {
      await Post_react.create(data);
      message = "Liked";
      return message;
    } else if (like) {
      await Post_react.destroy({
        where: {
          user_id,
          post_id,
        },
      });
      let message = "Unliked";
      return message;
    }
  } catch (err) {
    throw err;
  }
};

exports.commentPost = async (cmt, postId, userId) => {
  let isPostExist = await checkPostExist(postId);
  if (!isPostExist) {
    throw new Error("Post is not exist");
  }
  if (!checkEmpty(cmt) || !checkEmpty(postId)) {
    throw new Error("Empty input");
  } else {
    const data = {
      text: cmt.comment,
      created_at: Date.now(),
      parent_cmt_id: cmt.parentCommentId,
      user_id: userId,
      post_id : postId,
    };
    await Comment.create(data);
  }
};

const checkPostExist = async (id) => {
  try {
    if (!isNaN(id)) {
      const post = await Post.findByPk(id);
      return post;
    }
    return false;
  } catch (error) {
    throw error;
  }
};

const checkEmpty = async (value) => {
  if (!value || 0 === value.length) {
    return true;
  }
  return false;
};


exports.listPost = async (user_id, sort, paging) => {
  try {
    let limit = paging['limit'];
    let offset = paging['offset'];
    if (
      isEmpty(limit) ||
      isEmpty(offset) ||
      isEmpty(sort)
    ) {
          limit = 2;
          offset= 0;
    }
    let filter = [];
    if (sort === "-created") {
      filter.push(["created_at", "Desc"]);
    }
    if (!checkPostExist) {
      throw new Error("Post is not exist");
    } else {
      let posts = await Post.findAll({
        where : {
          user_id: user_id
        },
        attributes:['description','created_at'],
        order: filter,
          include:
          [{  model: Image,
              attributes:['caption','path'],
              required:true,
          }],
          limit: limit,
          offset: offset
           });
      return posts;
    }
  } catch (err) {
    throw err;
  }
};

exports.updatePost = async (post_id, description, image,user_id) => {
  try {
    let isPostExist = await checkPostExist(post_id);
    if (!isPostExist) {
      throw new Error("Post is not exist");
    }
    if (!description || typeof description !== "string")
      throw new Error('ERROR_CODE.INVALID_INPUT');
    if (!checkEmpty(post_id) || !checkEmpty(description)) {
      throw new Error("Empty input");
    }
    let checkOwner = await Post.findAll({
      where: {
        user_id: user_id,
        id: post_id,
      },
    });
    if (checkOwner.length === 0) {
      let err = {
        code: "NOT_PERMISSON",
        message: "You don't have permission",
      };
      throw err;
    }
    //check if dont update image
    if(image[0]['uploadToken'][0]!==undefined){``
    let arrayImage = [];
    for (var i = 0; i < image[0].uploadToken.length; i++) {    
      let path = jwt.verify(
        image[0].uploadToken[i],
        process.env.ACCESS_TOKEN_SECRET
      );
      arrayImage.push({
        caption: image[0].caption[i],
        path: path,
      });
    }
    console.log(post_id);
    for (var i = 0; i < arrayImage.length; i++) {
        await Image.create({
        caption: arrayImage[i]["caption"],
        path: arrayImage[i]["path"],
        post_id: post_id,
      });
    }
  }
    await Post.update(
      { description: description },
      {
        where: {
          id: post_id,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};

exports.deletePost = async (post_id, user_id) => {
  try {
    let message;
    let isPostExist = await checkPostExist(post_id);
    let checkOwner = await Post.findAll({
      where: {
        user_id: user_id,
        id: post_id,
      },
    });
    if (checkOwner.length === 0) {
      let err = {
        code: "NOT_PERMISSON",
        message: "You don't have permission",
      };
      throw err;
      
    } else {
      await Post.destroy({
        where: {
          id: post_id,
        },
      });
      message = "Deleted";
    }
    if (!isPostExist) {
      throw new Error("Post is not exist");
    }

    return message;
  } catch (error) {
    throw error;
  }
};


//Kiểm tra chuỗi nhập vào có rỗng hay không
const isEmpty = function (value) {
  if (!value || 0 === value.length) {
    return true;
  }
};

//Kiểm tra có phải ngày tháng hay không
const isDate = function (value) {
  var formats = [
    moment.ISO_8601,
    "MM/DD/YYYY  :)  HH*mm*ss",
    "YYYY/MM/DD",
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "MM-DD-YYYY",
  ];
  if (moment(value, formats, true).isValid()) {
    return true;
  }
};

//Kiểm tra có phải email hay không
const isEmail = function (value) {
  let filter =
    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (filter.test(value)) {
    return true;
  } else {
    return false;
  }
};

// Functions check existence
const checkPostExistence = async (id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(id)) {
      const post = await Post.findByPk(id);
      return post;
    }
    return false;
  } catch (error) {
    throw error;
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
    throw error;
  }
};
const checkCommentExistsInPost = async (id, post_id) => {
  try {
    if (!isNaN(id) && !isNaN(post_id)) {
      const comment = await Comment.findOne({
        where: {
          id,
          post_id
        }
      });
      return comment;
    }
  } catch (err) {
    throw err;
  }
}
const checkCommentReactExistence = async (user_id, comment_id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(user_id) && !isNaN(comment_id)) {
      const like = await CommentReact.findOne({
        where: {
          user_id,
          comment_id,
        },
      });
      return like;
    }
  } catch (error) {
    throw error;
  }
};

// Function check ownership
const checkCommentOwnership = async (id, user_id) => {
  //Check condition where this comment belongs to the current user
  try {
    if (!isNaN(id) && !isNaN(user_id)) {
      const comment = await Comment.findOne({
        where: {
          id,
          user_id,
        },
      });
      return comment;
    }
  } catch (error) {
    throw error;
  }
};
