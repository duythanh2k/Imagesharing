const User = require("../models/user.model");
const Posts = require("../models/post.model");
const Images = require("../models/image.model");
const Follower = require("../models/follower.model");
const db = require("../models/db");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const bcrypt = require("bcryptjs");
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

//Đăng nhập
exports.signUp = async function (user) {
  if (
    isEmpty(user.email) ||
    isEmpty(user.first_name) ||
    isEmpty(user.last_name) ||
    isEmpty(user.dob)
  ) {
    let err = {
      code: "INVALID_INPUT",
      message: "Input data is invalid",
    };
    throw err;
  }
  if (!isEmail(user.email)) {
    let err = {
      code: "DATATYPE_ERROR",
      message: "Email is incorrect datatype",
    };
    throw err;
  }
  let checkEmail = await User.findOne({ where: { email: user.email } });
  if (checkEmail != null) {
    let err = {
      code: "ER_DUP_ENTRY",
      message: "Email must be unique",
    };
    throw err;
  }
  if (!isDate(user.dob)) {
    let err = {
      code: "INCORRECT_DATATYPE",
      message: "Date of birth is incorrect datatype",
    };
    throw err;
  }
  var result = await User.create(user);
  return result;
};

//Tạo một token mới khi đăng nhập
exports.generateToken = async (user, secretSignature) => {
  try {
    if (isEmpty(user.email) || isEmpty(user.password)) {
      let err = {
        code: "INVALID_INPUT",
        message: "Input data is invalid",
      };
      throw err;
    }
    let checkUser = await User.findOne({ where: { email: user.email } });
    if (checkUser === null) {
      let err = {
        code: "NOT_FOUND",
        message: "Can not found user",
      };
      throw err;
    }
    let isPassValid = bcrypt.compareSync(user.password, checkUser.password);
    if (!isPassValid) {
      let err = {
        code: "INCORRECT_PASSWORD",
        message: "Password is incorrect",
      };
      throw err;
    }
    const payload = {
      idUser: checkUser.id,
      email: checkUser.email,
    };
    return jwt.sign(
      {
        payload,
      },
      secretSignature,
      {
        algorithm: "HS256",
      }
    );
  } catch (error) {
    throw error;
  }
};

//Lấy thông tin user
exports.profile = async (email) => {
  try {
    let result = await User.findOne({ where: { email: email } });
    return (data = {
      first_name: result.first_name,
      last_name: result.last_name,
      dob: result.dob,
      gender: result.gender,
      avatar: result.avatar,
    });
  } catch (err) {
    throw error;
  }
};

//Cập nhật thông tin user
exports.updateProfile = async (email, user) => {
  try {
    if (!isEmpty(user.dob) && !isDate(user.dob)) {
      let err = {
        code: "INCORRECT_DATATYPE",
        message: "Date of birth is incorrect datatype",
      };
      throw err;
    }
    await User.update(user, {
      where: {
        email: email,
      },
    });
  } catch (err) {
    throw err;
  }
};

//Lấy tất cả các ảnh của user login
exports.getAllImageUser = async (idUser, requests) => {
  try {
    if (
      isEmpty(requests.limit) ||
      isEmpty(requests.offset) ||
      isEmpty(requests.sort_by) ||
      isEmpty(requests.order_by)
    ) {
      let err = {
        code: "INVALID_INPUT",
        message: "Query params is invalid",
      };
      throw err;
    }
    // let result=await Images.findAll({
    //     attributes:['id','path','caption',`Post.created_at`],
    //     include:
    //     [{  model:Posts,
    //         required:true,
    //         attributes:['created_at'],
    //         where:{
    //             user_id:user.id,
    //         },
    //         order:[
    //             ['created_at','DESC']
    //         ]
    //     }],
    //     limit: Number(requests.limit),
    //     offset: Number(requests.offset)
    //      });
    let result = await db.query(
      `select images.path,images.caption 
                        from posts INNER JOIN images ON posts.id=images.post_id
                        Where posts.user_id=${idUser}
                        order by ${requests.sort_by} ${requests.order_by}
                        limit ${requests.limit}
                        offset ${requests.offset}`,
      { plain: false, type: QueryTypes.SELECT }
    );
    return result;
  } catch (err) {
    throw err;
  }
};

//Cập nhật caption mới cho image
exports.updateCapImage = async (id, newCaption) => {
  try {
    await Images.update(
      {
        caption: newCaption,
      },
      {
        where: { id: id },
      }
    );
  } catch (err) {
    throw err;
  }
};

//Xóa image
exports.deleteImage = async (id) => {
  try {
    await Images.destroy({
      where: { id: id },
    });
  } catch (err) {
    throw err;
  }
};

exports.getAllFollowing = async (user_id, requests) => {
  try {
    if (isEmpty(requests.limit) || isEmpty(requests.offset)) {
      let err = {
        code: "INVALID_INPUT",
        message: "Query params is invalid",
      };
      return err;
    }
    // Get all the user that current user is following
    // by compare all "follower_id" of 'user following list' with current userId
    let following = await Follower.findAll({
      where: {
        follower_id: user_id,
      },
      offset: Number(requests.offset),
      limit: Number(requests.limit),
    });
    return following;
  } catch (err) {
    return err;
  }
};




// Functions check existence
const checkUserExistence = async (id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(id)) {
      const user = await User.findByPk(id);
      return user;
    }
  } catch (error) {
    return error;
  }
};
