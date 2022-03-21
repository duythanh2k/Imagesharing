const User = require('./models/user.model');
const Follower = require('./models/follower.model');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const { QueryTypes, Op } = require('sequelize');
const db = require('../util/db');
const date = require('date-and-time');

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
  //Kiểm tra dữ liệu nhập vào của first_name và last_name
  let nameCheck= /[0-9@$!%*?&]/
  if(nameCheck.test(user.first_name) || /^\s/.test(user.first_name)){
    let err = {
      code: 'DATATYPE_ERROR',
      message: 'First name is incorrect datatype',
    };
    throw err;
  }
  if(nameCheck.test(user.last_name)|| /^\s/.test(user.last_name)){
    let err = {
      code: 'DATATYPE_ERROR',
      message: 'Last name is incorrect datatype',
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
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //Kiểm tra định dạng password
  if (regex.test(user.password) == false) {
    console.log(regex.test(user.password));
    let err = {
      code: 'INCORRECT_DATATYPE',
      message: 'Password is incorrect datatype',
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
  console.log(user.gender);
  if (user.gender != 'male' && user.gender != 'female') {
    let err = {
      code: 'INCORRECT_DATA_INPUT',
      message: 'Gender is incorrect data',
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
    //Kiểm tra dữ liệu nhập vào của first_name và last_name
    let nameCheck= /[0-9@$!%*?&]/
    if(!isEmpty(user.first_name) && (nameCheck.test(user.first_name) || /^\s/.test(user.first_name))){
      let err = {
        code: 'DATATYPE_ERROR',
        message: 'First name is incorrect datatype',
      };
      throw err;
    }
    if(!isEmpty(user.last_name) &&(nameCheck.test(user.last_name)|| /^\s/.test(user.last_name))){
      let err = {
        code: 'DATATYPE_ERROR',
        message: 'Last name is incorrect datatype',
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
    if (isEmpty(requests.offset)) {
      requests.offset = 0;
    }
    if (isEmpty(requests.limit)) {
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
      let err = {
        code: 'INVALID_INPUT',
        message: 'Can not follow self!',
      };
      throw err;
    }
    if (!isUserExists) {
      // Check if there is an user in database
      let err = {
        code: 'NOT_FOUND',
        message: 'User not found!',
      };
      throw err;
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
    if (isEmpty(requests.offset)) {
      requests.offset = 0;
    }
    if (isEmpty(requests.limit)) {
      requests.limit = 2;
    }
    let condition;
    // Check if there is no query
    // then data return all users
    if (!requests.search) {
      condition = null;
    } else {
      // OR operator by require ( `const {Op} = require('sequelize') )
      condition = await searchQuery(requests.search);
    }
    users = User.findAll({
      attributes: ["id","first_name","last_name","dob","gender","avatar"],
      where: condition,
      offset: Number(requests.offset),
      limit: Number(requests.limit),
    });

    return users;
  } catch (err) {
    throw err;
  }
};

// search image
exports.getAllImage = async (
  idUser,
  createdBy,
  following,
  search,
  startDate,
  endDate,
  limit,
  offset
) => {
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

    //  search images by created By user?
    var createdByWhereClause = '';
    if (createdBy) {
      // check if createdBy is number integer
      if (!isNumber(createdBy)) {
        var err = {
          code: 'INVALID_INPUT',
          message: 'Please input number is integer',
        };
        throw err;
      }
      //query search images by user_id
      createdByWhereClause = `AND posts.user_id = ${createdBy}`;
    }

    //search images by following, followers of user login
    var followingWhereClause = '';
    if (following) {
      //check if following input is true/false
      // then data return images by following/followers
      if (following == 'true' || following == 'TRUE') {
        followingWhereClause = `AND (posts.user_id IN 
                              (SELECT followed_id FROM \`followers\` 
                                WHERE follower_id = ${idUser}))`;
      } else if (following == 'false' || following == 'FALSE') {
        followingWhereClause = `AND (posts.user_id IN 
                              (SELECT follower_id FROM \`followers\` 
                                WHERE followed_id = ${idUser}))`;
      } else {
        //then data return error
        var err = {
          code: 'INVALID_INPUT',
          message:
            'Please input following is true(following) or false(followers)',
        };
        throw err;
      }
    }

    // search images by caption or description or email or userPost
    var searchWhereClause = '';
    if (search) {
      searchWhereClause = ` AND (images.caption like '%${search}%' 
      or posts.description like '%${search}%'
      or users.email like '%${search}%'
      or CONCAT(users.first_name, ' ', users.last_name) LIKE '%${search}%')`;
    }

    // search images by date
    var dateWhereClause = '';
    if (startDate && endDate) {
      // check date input
      if (!isDate(startDate) || !isDate(endDate)) {
        var err = {
          code: 'INCORRECT_DATATYPE',
          message: 'Input date time is incorrect datatype',
        };
        throw err;
      }
      if (startDate.valueOf() > endDate.valueOf()) {
        var err = {
          code: 'INVALID_INPUT',
          message: 'End_date must be greater than or equal to start_date',
        };
        throw err;
      }
      var fdate = date.format(new Date(startDate), 'YYYY/MM/DD HH:mm:ss');
      var edate = date.format(new Date(endDate), 'YYYY/MM/DD HH:mm:ss');
      //query search image by date
      dateWhereClause = `AND (posts.created_at between '${fdate}' and '${edate}')`;
    }

    //query search
    const rows = await db.query(
      `SELECT images.caption,  images.path, posts.description,posts.created_at, 
      CONCAT(users.first_name, ' ', users.last_name) as userPost , users.email,users.id as userId
      FROM \`images\`
        JOIN \`posts\`
          ON images.post_id = posts.id
        JOIN \`users\`
          ON users.id=posts.user_id
        WHERE 1 = 1
        ${followingWhereClause}
        ${createdByWhereClause}
        ${searchWhereClause}
        ${dateWhereClause}
       
      LIMIT ${limit}
      OFFSET ${offset}
      `,
      { plain: false, type: QueryTypes.SELECT }
    );
    return rows;
  } catch (error) {
    throw error;
  }
};
//check is number ?
const isNumber = function (value) {
  try {
    return !Number.isNaN(parseInt(value));
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
  return {
    [Op.or]: [
      {
        first_name: {
          [Op.like]: '%' + requests + '%',
        },
      },
      {
        last_name: {
          [Op.like]: '%' + requests + '%',
        },
      },
      {
        email: {
          [Op.like]: '%' + requests + '%',
        },
      },
      {
        gender: requests
      }
    ]
  };
};