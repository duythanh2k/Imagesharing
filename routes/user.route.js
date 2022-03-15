const express = require('express');
const router = express.Router();

const authenMiddleware = require('../Middleware/authen.middleware');
const userController = require('../controllers/user.controller');

router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
router.get('/users/profile', authenMiddleware.isAuth, userController.profile);
router.put('/users/profile', authenMiddleware.isAuth, userController.updateProfile);
//Follow
<<<<<<< HEAD
router.get('/users/following',authenMiddleware.isAuth,userController.getAllFollowing);
router.post('/users/:id/follow',authenMiddleware.isAuth,userController.follow);
router.get('/users', authenMiddleware.isAuth, userController.searchUsers);

//search images
router.get('/users/images',authenMiddleware.isAuth,userController.getAllImage);
// router.get(
//   '/users/images-search',
//   authenMiddleware.isAuth,
//   userController.getImageBy
// );
=======
router.get('/users/following', authenMiddleware.isAuth, userController.getAllFollowing);
router.post('/users/:id/follow', authenMiddleware.isAuth, userController.follow);
router.get('/users', authenMiddleware.isAuth, userController.searchUsers);

//search images
router.get('/users/images', authenMiddleware.isAuth,userController.getAllImage);
>>>>>>> b5963c38ee98745dfa332dd2b02d0fa7809c3e55

module.exports = router;
