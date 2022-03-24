const Post = require('./models/post.model');
const Comment = require('./models/comment.model');
const React = require('./models/react.model');
const Image = require('./models/image.model');
const jwt = require('jsonwebtoken');
const Sharp=require('sharp');
const { Sequelize, QueryTypes, Op } = require('sequelize');
const aws =require('aws-sdk');
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-southeast-1",
  signatureVersion: "v4",
});
//Lấy tất cả các ảnh của user login
exports.getAllImageUser = async (idUser, requests) => {
  try {
    //Kiểm tra dữ liệu nhập vào có trống hay không, nếu trống thì set default
    if (isEmpty(requests.limit)) {
      requests.limit = 20;
    }
    if (isEmpty(requests.offset)) {
      requests.offset = 0;
    }
    if (isEmpty(requests.sort_by)) {
      requests.sort_by = 'created_at';
    }
    if (isEmpty(requests.order_by)) {
      requests.order_by = 'DESC';
    }
    let result = await Image.findAll({
      // attributes: ['id', 'path', 'caption'],
      include: [
        {
          model: Post,
          attributes: ['created_at'],
          required: true,
          where: {
            user_id: idUser,
          },
          order: [[requests.sort_by, requests.order_by]],
        },
      ],
      order: [[Sequelize.col(requests.sort_by), requests.order_by]],
      limit: Number(requests.limit),
      offset: Number(requests.offset),
    });
    return result;
  } catch (err) {
    throw err;
  }
};

//Cập nhật caption mới cho image
exports.updateCapImage = async (idImage, idUser, newCaption) => {
  try {
    //Kiểm tra image có tồn tại hay không
    let check = await Image.findOne({ where: { id: idImage } });
    if (!check) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Can not found your images',
      };
      throw err;
    }
    // Kiểm tra caption có undefined hay không
    if (newCaption === undefined) {
      let err = {
        code: 'INVALID_INPUT',
        message: 'Input data is invalid',
      };
      throw err;
    }
    let checkOwner = await Image.findAll({
      where: { id: idImage },
      include: [{ model: Post, required: true, where: { id: idUser } }],
    });
    //Kiểm tra ảnh có phải của tk đang login
    if (checkOwner.length === 0) {
      let err = {
        code: 'NOT_PERMISSON',
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
      }
    );
    return;
  } catch (err) {
    throw err;
  }
};

//Xóa image
exports.deleteImage = async (idUser, idImage) => {
  try {
    //Kiểm tra image có tồn tại hay không
    let check = await Image.findOne({
      attributes:['link_origin'],
       where: { id: idImage } });
    if (!check) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Can not found your images',
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
        code: 'NOT_PERMISSON',
        message: "You don't have permission",
      };
      throw err;
    }
    await Image.destroy({
      where: { id: idImage },
    });
    let key =check.dataValues.link_origin.split('/');
    await deleteImgS3(key[1]);
    return;
  } catch (err) {
    throw err;
  }
};

// Get all comments of a post sort by timestamp
exports.getAllCmtDesc = async (post_id, requests) => {
  try {
    // query for sort comment by descend timestamp
    if (isEmpty(requests.sort_by)) {
      requests.sort_by = 'created_at';
    }
    if (isEmpty(requests.order_by)) {
      requests.order_by = 'DESC';
    }
    if (isEmpty(requests.offset)) {
      requests.offset = 0;
    }
    if (isEmpty(requests.limit)) {
      requests.limit = 2;
    }

    let isPostExists = await checkPostExistence(post_id);
    // Check if there is a post in database
    if (!isPostExists) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Post not found!',
      };
      throw err;
    }
    // find all comments of current post and sort comments by lateset timestamp
    let comment = await Comment.findAll({
      attributes: ["id","text","created_at","parent_cmt_id","user_id","post_id"],
      where: {
        post_id,
      },
      // Order condition
      order: [[requests.sort_by, requests.order_by]],
      offset: Number(requests.offset),
      limit: Number(requests.limit),
    });
    return comment;
  } catch (err) {
    throw err;
  }
};

//Update a comment of a post
exports.updateComment = async (user_id, post_id, comment_id, newText) => {
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
    let neededComment = await Comment.findOne({
      where: {
        id: comment_id,
        post_id
      }
    });

    if (newText === undefined){
      let err = {
        code: "INVALID_INPUT",
        message: "Text required.",
      };
      throw err;
    }
    if (isEmpty(newText)) {
      return neededComment;
    }
    neededComment.update({
      text: newText
    });
    return neededComment;
  } catch (err) {
    throw err;
  }
}

// Delete a comment of a post
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
        code: 'NOT_FOUND',
        message: 'Post not found!',
      };
      throw err;
    }
    if (!isCommentExists) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Comment not found!',
      };
      throw err;
    }
    if (!isCommentOfPost) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Comment does not exists in this post!',
      };
      throw err;
    }
    if (!isOwn) {
      let err = {
        code: 'NOT_PERMISSON',
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

exports.likeComment = async (user_id, post_id, comment_id) => {
  try {
    let isPostExists = await checkPostExistence(post_id);
    let isCommentExists = await checkCommentExistence(comment_id);
    let alreadyLiked = await checkReactExistence(user_id, 1, comment_id);
    let isCommentOfPost = await checkCommentExistsInPost(comment_id, post_id);
    let message;

    // Check if there is a post in database
    if (!isPostExists) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Post not found!',
      };
      throw err;
    }
    // Check if there is a comment in database
    if (!isCommentExists) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Comment not found!',
      };
      throw err;
    }
    if (!isCommentOfPost) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Comment does not exists in this post!',
      };
      throw err;
    }
    if (alreadyLiked) {
      message = 'Unliked!';
      // Destroy like when call twice
      await React.destroy({
        where: {
          user_id,
          type: 1,
          type_id: comment_id,
        },
      });
      return message;
    }
    message = 'Liked!';
    // Create a new like
    await React.create({
      user_id,
      type: 1,
      type_id: comment_id,
    });
    return message;
  } catch (err) {
    // Call API again with the same user_id and comment_id will cause error
    throw err;
  }
};


exports.generateUploadUrl = async (numberImage) => {
  let imageInfor = [];
  for (var i = 0; i < numberImage; i++) {
    const imageName =
      "origin/"+Date.now() + "-" + Math.round(Math.random() * 1e9) + ".png";
    const params = {
      Bucket: "savvycom-insta-app",
      Key: imageName,
    };
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    const urlImage = uploadURL.split("?")[0];
    imageInfor.push({
      uploadURL : uploadURL,
      urlImage : urlImage
    })
  };
  return imageInfor;
};

exports.uploadPost = async (description, image, id) => {
  try {
    if (typeof description !== "string")
      throw new Error("ERROR_CODE.INVALID_INPUT");
    if (isEmpty(description)) throw new Error("ERROR_CODE.INVALID_INPUT");
    let thumnail={type: 'thumbnail', width: 60 , height: 60}
    let imgpost={type: 'imgpost', width:  1600, height: 900}
    let arrayImage = [];
    let arr=image.split(',');
    for (let i = 0; i < arr.length; i++) {  
      let linkOrigin=arr[i].split("/");
      let origin= linkOrigin[4] ;
      await checkImageUpload(origin);
      let metadata={
        height : '',
        width:  '',
        extendsion: '.png'
      };
      arrayImage.push({
        link_origin : 'origin/'+origin,
        link_thumbnail : `thumnail/${origin}`,
        link_post : `post/${origin}`,
        metadata: metadata
      });
      await getImageResize(origin,thumnail);
      await getImageResize(origin,imgpost);
    }
    const dataPost = {
      description: description,
      created_at: Date.now(),
      user_id: id,
    };
    let post = await Post.create(dataPost);
    let post_id = post.dataValues.id;
    for (let i = 0; i < arrayImage.length; i++) {
      await Image.create({
        link_origin : arrayImage[i].link_origin,
        link_thumbnail : arrayImage[i].link_thumbnail,
        link_post : arrayImage[i].link_post,
        metadata:arrayImage[i].metadata,
        post_id: post_id
      });
    }
    const result = {
      description: description,
      image: arrayImage,
    };
    return result;
  } catch (error) {
    throw error;
  }
};

exports.likePost = async (user_id, post_id) => {
  try {
    let isPostExists = await checkPostExistence(post_id);
    let alreadyLiked = await checkReactExistence(user_id, 0, post_id);
    let message;
    if (!isPostExists) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Post not found!',
      };
      throw err;
    }
    if (alreadyLiked) {
      message = 'Unliked!';
      // Destroy like when call twice
      await React.destroy({
        where: {
          user_id,
          type: 0,
          type_id: post_id,
        },
      });
      return message;
    }
    message = 'Liked!';
    // Create a new like
    await React.create({
      user_id,
      type: 0,
      type_id: post_id,
    });
    return message;
  } catch (err) {
    throw err;
  }
};

exports.commentPost = async (cmt, postId, userId) => {
  let isPostExist = await checkPostExistence(postId);
  if (!isPostExist) {
    throw new Error('Post is not exist');
  }
  if (isEmpty(cmt) || isEmpty(postId)) {
    throw new Error('Empty input');
  } else {
    const data = {
      text: cmt,
      created_at: Date.now(),
      user_id: userId,
      post_id: postId,
    };
    await Comment.create(data);
  }
};
exports.replyComment = async (data) => {
  let isPostExist = await checkPostExistence(data.post_id);
  if (!isPostExist) {
    let err = {
      code: 'NOT_EXISTS',
      message: "Post is not exists",
    };
    throw err;
  }
  let isParentCMTExist=await checkCommentExistence(data.parent_id);
  if(!isParentCMTExist){
    let err = {
      code: 'NOT_EXISTS',
      message: "Comment is not exists",
    };
    throw err;
  }
  if (isEmpty(data.cmt)) {
    let err = {
      code: 'INVALID_INPUT',
      message: "Input data is invalid",
    };
    throw err;
  } else {
    const newData = {
      text: data.cmt,
      created_at: Date.now(),
      parent_cmt_id: data.parent_id,
      user_id: data.user_id,
      post_id: data.post_id,
    };
    await Comment.create(newData);
  }
};

exports.listPost = async (user_id, sort, paging) => {
  try {
    let limit = paging["limit"];
    let offset = paging["offset"];
    if (isEmpty(limit) || isEmpty(offset) || isEmpty(sort)) {
      limit = 2;
      offset = 0;
    }
    let filter = [];
    if (sort === "-created") {
      filter.push(["created_at", "Desc"]);
    }
      let posts = await Post.findAll({
        where: {
          user_id: user_id,
        },
        attributes: ["description", "created_at"],
        order: filter,
        include: [
          { model: Image,  required: true },
        ],
        limit: limit,
        offset: offset,
      });
      return posts;
    
  } catch (err) {
    throw err;
  }
};

exports.updatePost = async (post_id, description, image, user_id) => {
  try {
    let isPostExist = await checkPostExistence(post_id);
    if (!isPostExist) {
      throw new Error('Post is not exist');
    }
    // if (!description || typeof description !== 'string')
    //   throw new Error('ERROR_CODE.INVALID_INPUT');
    // if (!isEmpty(post_id) || !isEmpty(description)) {
    //   throw new Error('Empty input');
    // }
    let checkOwner = await Post.findAll({
      where: {
        user_id: user_id,
        id: post_id,
      },
    });
    if (checkOwner.length === 0) {
      let err = {
        code: 'NOT_PERMISSON',
        message: "You don't have permission",
      };
      throw err;
    }
    let thumnail={type: 'thumbnail', width: 60 , height: 60}
    let imgpost={type: 'imgpost', width:  1600, height: 900}
    //check if dont update image
    if (image) {
      let arrayImage = [];
      let arr=image.split(',');
      for (let i = 0; i < arr.length; i++) {  
        let linkOrigin=arr[i].split("/");
        let origin= linkOrigin[4] ;
        console.log(origin)
        await checkImageUpload(origin);
        let metadata={
          height : '',
          width:  '',
          extendsion: '.png'
        };
        arrayImage.push({
          link_origin : 'origin/'+origin,
          link_thumbnail : `thumnail/${origin}`,
          link_post : `post/${origin}`,
          metadata: metadata
        });
        await getImageResize(origin,thumnail);
        await getImageResize(origin,imgpost);
        for (let i = 0; i < arrayImage.length; i++) {
          await Image.create({
            link_origin : arrayImage[i].link_origin,
            link_thumbnail : arrayImage[i].link_thumbnail,
            link_post : arrayImage[i].link_post,
            metadata:arrayImage[i].metadata,
            post_id: post_id
          });
        }
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
    let isPostExist = await checkPostExistence(post_id);
    let checkOwner = await Post.findAll({
      where: {
        user_id: user_id,
        id: post_id,
      },
    });
    if (!isPostExist) {
      let err = {
        code: 'NOT_EXISTS',
        message: "Post is not exists",
      };
      throw err;
    }
    if (checkOwner.length === 0) {
      let err = {
        code: 'NOT_PERMISSON',
        message: "You don't have permission",
      };
      throw err;
    } else {  
      let listImg= await Image.findAll({
        where:{
          post_id:post_id
        }
      });
      for(let element =0;element<listImg.length; element++){
        let key =listImg[element].dataValues.link_origin.split('/');
        await deleteImgS3(key[1])
      }
      let listCmt=await Comment.findAll({
        attributes: ['id'],
        where:{
          post_id:post_id
        }
      })
      for(let i=0; i<listCmt.length;i++){
        await React.destroy({
          where:{
            type : '1',
            type_id:listCmt[i].dataValues.id
          }
        })
      }
      await React.destroy({
        where:{
          type : '0',
          type_id: post_id
        }
      })
      await Post.destroy({where: {id: post_id}});
      await Comment.destroy({where:{post_id:post_id}})
      await Image.destroy({ where:{post_id:post_id}})
      message = 'Deleted';
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
    'MM/DD/YYYY  :)  HH*mm*ss',
    'YYYY/MM/DD',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'MM-DD-YYYY',
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
          post_id,
        },
      });
      return comment;
    }
  } catch (err) {
    throw err;
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

const checkReactExistence = async (user_id, type, type_id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(user_id) && !isNaN(type_id)) {
      const like = await React.findOne({
        where: {
          user_id,
          type,
          type_id,
        },
      });
      return like;
    }
  } catch (error) {
    throw error;
  }
};

const getImageResize =async (originalKey,img)=>{
  let key=`${img.type}/${originalKey}`
  s3.getObject({Bucket: process.env.BUCKET, Key: 'origin/'+originalKey}).promise()
    .then(data => Sharp(data.Body)
      .resize(img.width,img.height, {
        withoutEnlargement: true,
        fit: 'inside'
        })
      .toFormat('png')
      .toBuffer()
    )
    .then(buffer => s3.putObject({
        Body: buffer,
        Bucket: process.env.BUCKET,
        ContentType: 'image/png',
        Key: key,
      }).promise()
    )
    .then(() =>{ return `${URL}/${key}`
    })
}
const deleteImgS3 =async(key)=>{
  var deleteParam = {
    Bucket: process.env.BUCKET,
    Delete: {
        Objects: [
            {Key: 'origin/'+key},
            {Key: 'thumbnail/'+key},
            {Key: 'imgpost/'+key}
        ]
    }
};    
s3.deleteObjects(deleteParam, function(err, data) {
    if (err){
      let error = {
        code: 'DELETE_FAIL',
        message: 'Can not delete image',
      };
      throw error;
    }
});
}

function checkImageUpload(key) {
  return new Promise((resolve, reject) => {
   s3.headObject({ Bucket: process.env.BUCKET, Key: 'origin/'+key }, (err, metadata) => {
    if (err) {
      let error = {
        code: 'NOT_FOUND',
        message: 'Image is not uploaded',
      };
     return reject(error);
    }
    return resolve(metadata);
   });
  });
 }