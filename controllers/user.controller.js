const userService = require('../services/user.service');

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
      status: 'Success',
      code: null,
      message: null,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
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
      status: 'Success',
      code: null,
      message: null,
      data: accessToken,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

//Xem thông tin cá nhân
exports.profile = async (req, res, next) => {
  try {
    let result = await userService.profile(req.idUser);
    return res.json({
      status: 'Success',
      code: null,
      message: null,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

//Cập nhập thông tin cá nhân
exports.updateProfile = async (req, res, next) => {
  try {
    let idUser = req.idUser;
    let user = req.body;
    await userService.updateProfile(idUser, user);
    return res.json({
      status: 'Success',
      code: null,
      message: null,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

// Get all users that current user has followed
exports.getAllFollowing = async (req, res) => {
  try {
    let userId = req.idUser;
    let requests = req.query;
    let following = await userService.getAllFollowing(userId, requests);
    return res.json({
      status: 'Success',
      code: null,
      message: null,
      data: following,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

// Follow/Unfollow other users
exports.follow = async (req, res) => {
  try {
    let results = await userService.follow(req.idUser, req.params.id);
    return res.json({
      status: 'Success',
      code: null,
      message: results,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

// Search for other users
exports.searchUsers = async (req, res) => {
  try {
    let requests = req.query;
    let results = await userService.searchUsers(requests);
    return res.json({
      status: 'Success',
      code: null,
      message: null,
      data: results,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

//search image
exports.getAllImage = async (req, res) => {
  try {
    let idUser = req.idUser;
    let createdBy = req.query.createdBy;
    let following = req.query.following;
    let search = req.query.search;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let limit = req.query.limit;
    let offset = req.query.offset;

    const result = await userService.getAllImage(
      idUser,
      createdBy,
      following,
      search,
      startDate,
      endDate,
      limit,
      offset
    );
    return res.json({
      status: 'Success',
      code: null,
      message: null,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Error',
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};
