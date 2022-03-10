const userService = require("../services/user.service");
const bcrypt      = require("bcryptjs");

//Đăng ký
exports.signUp = async function (req, res, next) {
  try {
    const user = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      dob: req.body.dob,
      gender: req.body.gender,
      avatar: req.body.avatar,
    };
    await userService.signUp(user);
    res.status(200).json({
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

//Đăng nhập
exports.signIn = async (req, res) => {
  try {
    const user = {
      email: req.body.email,
      password: req.body.password,
    };
    const accessToken = await userService.generateToken(
      user,
      process.env.ACCESS_TOKEN_SECRET
    );
    return res.json({
      status: "Success",
      code: null,
      message: null,
      data: accessToken,
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

//Xem thông tin cá nhân
exports.profile = async (req, res, next) => {
  try {
    let result = await userService.profile(req.email);
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

//Cập nhập thông tin cá nhân
exports.updateProfile = async (req, res, next) => {
  try {
    let email = req.email;
    let user = req.body;
    await userService.updateProfile(email, user);
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

//Lấy tất cả các ảnh của cá nhân
exports.getAllImageUser = async (req, res, next) => {
  try {
    let idUser = req.idUser;
    let requests = req.query;
    let result = await userService.getAllImageUser(idUser, requests);
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
    let id = req.params.id;
    let newcapIamge = req.body.caption;
    await userService.updateCapImage(id, newcapIamge);
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
    let id = req.params.id;
    await userService.deleteImage(id);
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
