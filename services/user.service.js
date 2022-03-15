const User = require('../models/user.model');
const Posts = require('../models/post.model');
const Images = require('../models/image.model');
const Follower = require('../models/follower.model');
const db = require('../util/db');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const { QueryTypes, Op } = require('sequelize');
const { request } = require('express');
const date = require('date-and-time');

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

//Đăng nhập
exports.signUp = async function (user) {
  //Kiểm tra dữ liệu nhập vào có trống hay không
  if (
    isEmpty(user.email) ||
    isEmpty(user.password) ||
    isEmpty(user.first_name) ||
    isEmpty(user.last_name) ||
    isEmpty(user.dob)
  ) {
    let err = {
      code: 'INVALID_INPUT',
      message: 'Input data is invalid',
    };
    throw err;
  }
  // Kiểm tra định dạng email
  if (!isEmail(user.email)) {
    let err = {
      code: 'DATATYPE_ERROR',
      message: 'Email is incorrect datatype',
    };
    throw err;
  }
  // Kiểm tra user có tồn tại hay chưa, có thì throw lỗi
  let checkEmail = await User.findOne({ where: { email: user.email } });
  if (checkEmail != null) {
    let err = {
      code: 'ER_DUP_ENTRY',
      message: 'Email must be unique',
    };
    throw err;
  }
  // Kiểm tra định dạng ngày tháng
  if (!isDate(user.dob)) {
    let err = {
      code: 'INCORRECT_DATATYPE',
      message: 'Date of birth is incorrect datatype',
    };
    throw err;
  }
  const hashPass = bcrypt.hashSync(user.password, 10);
  user.password = hashPass;
  var result = await User.create(user);
  return result;
};

//Tạo một token mới khi đăng nhập
exports.generateToken = async (user, secretSignature) => {
  try {
    //Kiểm tra dữ liệu nhập vào có trống hay không
    if (isEmpty(user.email) || isEmpty(user.password)) {
      let err = {
        code: 'INVALID_INPUT',
        message: 'Input data is invalid',
      };
      throw err;
    }
    // Kiểm tra tài khoản có tồn tại hay không, nếu không thì in ra lỗi
    let checkUser = await User.findOne({ where: { email: user.email } });
    if (checkUser === null) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Can not found user',
      };
      throw err;
    }
    //Kiểm tra mật khẩu chính xác hay không
    let isPassValid = bcrypt.compareSync(user.password, checkUser.password);
    if (!isPassValid) {
      let err = {
        code: 'INCORRECT_PASSWORD',
        message: 'Password is incorrect',
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
        algorithm: 'HS256',
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
        code: 'INCORRECT_DATATYPE',
        message: 'Date of birth is incorrect datatype',
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

// Get all users that the current user has followed
exports.getAllFollowing = async (user_id, requests) => {
  let followers;
  const findBy = [];
  try {
    if (isEmpty(requests.limit) || isEmpty(requests.offset)) {
      requests.offset = 0;
      requests.limit = 2;
    }

    // Get all followed id and parse it to number
    let getFollowedId = await Follower.findAll({
      attributes: ['followed_id'],
      where: {
        follower_id: user_id,
      },
    });
    const followedId = getFollowedId.map((index) =>
      Number(index.dataValues.followed_id)
    );
    let condition = [];
    const findBy = await searchQuery(requests.search);
    // Get all following of current user
    // Check if there is no query
    // then data return all following
    if (!requests.search) {
      condition.push({ id: followedId });
    } else {
      condition.push({
        id: followedId,
        [Op.or]: findBy,
      });
    }

    followers = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'avatar'],
      where: condition,
      offset: Number(requests.offset),
      limit: Number(requests.limit),
    });

    return followers;
  } catch (err) {
    throw err;
  }
};

// Follow/Unfollow other users
exports.follow = async (follower_id, followed_id) => {
  let message;
  try {
    let isUserExists = await checkUserExistence(followed_id);
    let alreadyFollowed = await checkFollowerExistence(
      follower_id,
      followed_id
    );
    if (Number(followed_id) === Number(follower_id)) {
      // Condition of not following self
      message = 'Cannot follow self!';
      return message;
    }
    if (!isUserExists) {
      // Check if there is an user in database
      message = 'User does not exist!';
      return message;
    }
    if (alreadyFollowed) {
      let message = 'Unfollowed!';
      // Destroy like when call twice
      await Follower.destroy({
        where: {
          follower_id,
          followed_id,
        },
      });
      return message;
    }
    message = 'Followed!';
    // Create new follow
    await Follower.create({
      follower_id,
      followed_id,
    });
    return message;
  } catch (err) {
    // Call API again with the same user_id and followed_id will cause error
    throw err;
  }
};

// Search for other users
exports.searchUsers = async (requests) => {
  let users;
  try {
    if (isEmpty(requests.limit) || isEmpty(requests.offset)) {
      requests.offset = 0;
      requests.limit = 2;
    }
    let condition = [];
    const findBy = await searchQuery(requests.search);
    // Check if there is no query
    // then data return all users
    if (!requests.search) {
      condition = null;
    } else {
      // OR operator by require ( `const {Op} = require('sequelize') )
      condition.push({ [Op.or]: findBy });
    }
    users = User.findAll({
      where: condition,
      offset: Number(requests.offset),
      limit: Number(requests.limit),
    });

    return users;
  } catch (err) {
    throw err;
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
    throw error;
  }
};
const checkFollowerExistence = async (follower_id, followed_id) => {
  //Check condition where the id exists
  try {
    if (!isNaN(follower_id) && !isNaN(followed_id)) {
      const like = await Follower.findOne({
        where: {
          follower_id,
          followed_id,
        },
      });
      return like;
    }
  } catch (error) {
    throw error;
  }
};

//Conditions for search query
const searchQuery = async (requests) => {
  const findBy = [];
  // If there is a query
  // then check if it is a email or not
  // if it is email type
  //    search by email
  // otherwise
  //    search by firstname/lastname
  if (!isEmail(requests)) {
    findBy.push(
      {
        first_name: {
          [Op.like]: '%' + requests + '%',
        },
      },
      {
        last_name: {
          [Op.like]: '%' + requests + '%',
        },
      }
    );
  } else {
    findBy.push({
      email: requests,
    });
  }
  return findBy;
};

// Do Tuan Thanh
// search image
exports.getAllImage = async (email, createdBy, following, limit, offset) => {
  try {
    //limit, offset
    let pageAsNumber = parseInt(offset);
    let sizeAsNumber = parseInt(limit);
    offset = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
      offset = pageAsNumber;
    }

    limit = 2;
    if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0) {
      limit = sizeAsNumber;
    }

    // query: lấy tất cả ảnh của người tạo
    let createdByWhereClause = '';
    if (!isNaN(createdBy)) {
      createdByWhereClause = `AND posts.user_id = ${createdBy}`;
    }

    //query: lấy tất cả ảnh theo following
    const user = await User.findOne({ email: email });
    let followingWhereClause = '';
    if (following == 'true') {
      followingWhereClause = `AND posts.user_id IN 
                              (SELECT followed_id FROM \`followers\` 
                                WHERE follower_id = ${user.id})`;
    }
    //
    const rows = await db.query(
      `SELECT images.caption,  images.path, posts.description,posts.created_at, 
        users.first_name , users.last_name,users.id as userId
      FROM \`images\`
        JOIN \`posts\`
          ON images.post_id = posts.id
        JOIN \`users\`
          ON users.id=posts.user_id
        WHERE 1 = 1
        ${followingWhereClause}
        ${createdByWhereClause}
       
      LIMIT ${limit}
      OFFSET ${offset} `,
      { plain: false, type: QueryTypes.SELECT }
    );
    if (Object.keys(rows).length === 0) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Not found image!',
      };
      throw err;
    }

    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getImageBy = async (search, limit, offset) => {
  try {
    let pageAsNumber = Number.parseInt(offset);
    let sizeAsNumber = Number.parseInt(limit);
    offset = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
      offset = pageAsNumber;
    }
    limit = 2;
    if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0) {
      limit = sizeAsNumber;
    }

    var searchWhereClause = '';
    if (search) {
      searchWhereClause = ` and images.caption like '%${search}%' or CONCAT(users.first_name, ' ', users.last_name) LIKE '%${search}%'`;
    }

    const rows = await db.query(
      `SELECT  images.caption,images.path,  posts.description,posts.created_at, CONCAT(users.first_name, ' ', users.last_name) as userPost, users.id as userId
       FROM \`images\`
        JOIN \`posts\`
          ON images.post_id = posts.id
	      JOIN \`users\` 
		      ON users.id=posts.user_id
        WHERE 1=1 
          ${searchWhereClause} 
      
        LIMIT ${limit}
        OFFSET ${offset} `,
      { plain: false, type: QueryTypes.SELECT }
    );
    if (Object.keys(rows).length === 0) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Not found image!',
      };
      throw err;
    }
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getImageByDate = async (startDate, endDate, limit, offset) => {
  try {
    let pageAsNumber = Number.parseInt(offset);
    let sizeAsNumber = Number.parseInt(limit);
    offset = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
      offset = pageAsNumber;
    }
    limit = 2;
    if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0) {
      limit = sizeAsNumber;
    }

    //search date
    if (!isDate(startDate) || !isDate(endDate)) {
      let err = {
        code: 'INCORRECT_DATATYPE',
        message: 'Input date time is incorrect datatype',
      };
      throw err;
    }

    var fdate = date.format(new Date(startDate), 'YYYY/MM/DD HH:mm:ss');
    var edate = date.format(new Date(endDate), 'YYYY/MM/DD HH:mm:ss');

    if (fdate.valueOf() > edate.valueOf()) {
      let err = {
        code: 'INVALID_INPUT',
        message: 'End date must be greater than or equal to start date',
      };
      throw err;
    }

    var dateWhereClause = '';
    if (startDate && endDate) {
      dateWhereClause = `and posts.created_at between '${fdate}' and '${edate}'`;
    }

    const rows = await db.query(
      `SELECT  images.caption,images.path,  posts.description,posts.created_at, users.first_name,users.last_name, users.id as userId
       FROM \`images\`
        JOIN \`posts\`
          ON images.post_id = posts.id
	      JOIN \`users\` 
		      ON users.id=posts.user_id
        WHERE 1=1
          ${dateWhereClause}
        LIMIT ${limit}
        OFFSET ${offset} `,
      { plain: false, type: QueryTypes.SELECT }
    );
    if (Object.keys(rows).length === 0) {
      let err = {
        code: 'NOT_FOUND',
        message: 'Not found image!',
      };
      throw err;
    }
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
