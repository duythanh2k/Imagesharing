const jwt = require('jsonwebtoken');

exports.isAuth = async (req, res, next) => {
  const accessToken = req.headers['authorization'];
  if (!accessToken) {
    return res.status(401).json({
      status: 'Error',
      code: 'NOT_FOUND',
      message: 'Can not found access token',
      data: null,
    });
  }

  const token = accessToken.split(' ')[1];
  try {
    let verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.idUser = verified.payload.idUser;
    req.email = verified.payload.email;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      status: 'Error',
      code: 'UNAUTHOREZID',
      message: 'You must login to continue',
      data: null,
    });
  }
};
