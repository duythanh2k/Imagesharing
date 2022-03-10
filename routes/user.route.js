const express =require('express');
const router = express.Router();

const authenMiddleware = require('../Middleware/authen.middleware')
const userController   = require('../controllers/user.controller');
router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
router.get('/users/profile', authenMiddleware.isAuth, userController.profile);
router.put('/users/profile', authenMiddleware.isAuth, userController.updateProfile);


module.exports = router
