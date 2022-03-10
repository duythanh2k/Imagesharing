const User   = require("../models/user.model");
const Posts  = require("../models/post.model");
const Comment = require("../models/comment.model");
const CommentReact = require("../models/comment_react.model");
const Images = require("../models/image.model");
const db     = require("../util/db");
const { QueryTypes } = require("sequelize");
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
    //   let result=await Images.findAll({
    //       attributes:['id','path','caption'],
    //       include:
    //       [{  model:Posts,
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
      let check = await Images.findOne({ where: { id : idImage } });
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
      let checkOwner=await Images.findAll({
            where: { id:idImage },
            include:
            [{  model:Posts,
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
      await Images.update(
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
      let check = await Images.findOne({ where: { id : idImage } });
      if(!check){
        let err = {
          code: "NOT_FOUND",
          message: "Can not found your images",
        };
        throw err;
      }
      let checkOwner=await Images.findAll({
        where: { id:idImage },
        include:
        [{  model:Posts,
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
      await Images.destroy({
        where: { id: idImage },
      });
      return;
    } catch (err) {
      throw err;
    }
  };
  

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
