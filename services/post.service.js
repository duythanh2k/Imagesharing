const Post           = require("../models/post.model");
const PostReact      = require("../models/post_react.model");
const Comment        = require("../models/comment.model");
const CommentReact   = require("../models/comment_react.model");
const Image          = require("../models/image.model");
const db             = require("../util/db");
const { QueryTypes } = require("sequelize");


//Lấy tất cả các ảnh của user login
exports.getAllImageUser = async (idUser, requests) => {
    try {
      //Kiểm tra dữ liệu nhập vào có trống hay không, nếu trống thì set default
      if (
        isEmpty(requests.limit) ||
        isEmpty(requests.offset) ||
        isEmpty(requests.sort_by) ||
        isEmpty(requests.order_by)
      ) {
        requests={
            limit: 20,
            offset: 0,
            sort_by: 'created_at',
            order_by: 'DESC'
        }
      }
    //   let result=await Image.findAll({
    //       attributes:['id','path','caption'],
    //       include:
    //       [{  model:Post,
    //           required:true,
    //           attributes:['created_at'],
    //           where:{
    //               user_id:idUser,
    //           },
    //           order:[
    //               ['created_at','DESC']
    //           ]
    //       }],
    //       limit: Number(requests.limit),
    //       offset: Number(requests.offset)
    //        });
      let result = await db.query(
        `Select images.id,images.path,images.caption 
        from posts INNER JOIN images ON posts.id=images.post_id
        Where posts.user_id=?
        ORDER BY ? ? 
        LIMIT ?  
        OFFSET ?`,
        { replacements:[idUser,requests.sort_by,requests.order_by,Number(requests.limit),Number(requests.offset)],
             type: QueryTypes.SELECT });
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
  };
  
  //Xóa image
  exports.deleteImage = async (idUser,idImage) => {
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
      let checkOwner=await Image.findAll({
        where: { id:idImage },
        include:
        [{  model:Post,
            required:true,
            where:{
                user_id:idUser,
            }
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
      await Image.destroy({
        where: { id: idImage },
      });
      return;
    } catch (err) {
      throw err;
    }
  };
  

// Get all comments of a post sort by timestamp
exports.getAllCmtDesc = async (id, requests) => {
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
        post_id: id,
      },
      // Order condition
      order: ordered,
      offset: Number(requests.offset),
      limit: Number(requests.limit)
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
        post_id: post_id,
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
  } catch (err) { // Call API again with the same user_id and comment_id will cause error
    throw err;
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
const checkCommentReactExistence = async (user_id, comment_id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(user_id) && !isNaN(comment_id)) {
      const like = await CommentReact.findOne({
        where: {
          user_id,
          comment_id
        }
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
        }
      });
      return comment;
    }
  } catch (error) {
    throw error;
  }
};
