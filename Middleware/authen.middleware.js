const userService = require("../services/user.service");
const jwt         = require("jsonwebtoken");
require("dotenv").config();

exports.isAuth = async (req, res, next) => {
  const accessToken = req.headers.authorization;
  
  if (!accessToken) {
    return res.status(401).json({
      status: "Error",
      code: "NOT_FOUND",
      message: "Can not found access token",
      data: null,
    });
  }

  return jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, verifiedJwt) => {
      if (err) {
        return res.status(403).json({
          status: "Error",
          code: "UNAUTHOREZID",
          message: "You must login to continue",
          data: null,
        });
      } else {
        req.idUser = verifiedJwt.payload.idUser;
        req.email = verifiedJwt.payload.email;
        next();
      }
    }
  );
};
