const User   = require("../models/user.model");
const Posts  = require("../models/post.model");
const Images = require("../models/image.model");
const db     = require("../util/db");
const jwt    = require("jsonwebtoken");
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
  //Kiểm tra dữ liệu nhập vào có trống hay không
  if (
    isEmpty(user.email) ||
    isEmpty(user.password)||
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
  // Kiểm tra định dạng email
  if (!isEmail(user.email)) {
    let err = {
      code: "DATATYPE_ERROR",
      message: "Email is incorrect datatype",
    };
    throw err;
  }
  // Kiểm tra user có tồn tại hay chưa, có thì throw lỗi
  let checkEmail = await User.findOne({ where: { email: user.email } });
  if (checkEmail != null) {
    let err = {
      code: "ER_DUP_ENTRY",
      message: "Email must be unique",
    };
    throw err;
  }
  // Kiểm tra định dạng ngày tháng
  if (!isDate(user.dob)) {
    let err = {
      code: "INCORRECT_DATATYPE",
      message: "Date of birth is incorrect datatype",
    };
    throw err;
  }
  const hashPass = bcrypt.hashSync(user.password, 10);
  user.password=hashPass;
  var result = await User.create(user);
  return result;
};

//Tạo một token mới khi đăng nhập
exports.generateToken = async (user, secretSignature) => {
  try {
    //Kiểm tra dữ liệu nhập vào có trống hay không
    if (isEmpty(user.email) || isEmpty(user.password)) {
      let err = {
        code: "INVALID_INPUT",
        message: "Input data is invalid",
      };
      throw err;
    }
    // Kiểm tra tài khoản có tồn tại hay không, nếu không thì in ra lỗi
    let checkUser = await User.findOne({ where: { email: user.email } });
    if (checkUser === null) {
      let err = {
        code: "NOT_FOUND",
        message: "Can not found user",
      };
      throw err;
    }
    //Kiểm tra mật khẩu chính xác hay không
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
exports.profile = async (idUser) => {
  try {
    let result = await User.findOne({ where: { id: idUser } });
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
exports.updateProfile = async (idUser, user) => {
  try {
    //Kiểm tra định dạng của ngày tháng nếu có
    if (!isEmpty(user.dob) && !isDate(user.dob)) {
      let err = {
        code: "INCORRECT_DATATYPE",
        message: "Date of birth is incorrect datatype",
      };
      throw err;
    }
    await User.update(user, {
      where: {
        id: idUser,
      },
    });
    return;
  } catch (err) {
    throw err;
  }
};
