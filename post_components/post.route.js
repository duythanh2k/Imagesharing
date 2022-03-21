const express = require('express');
const router = express.Router();

const authenMiddleware = require('../Middlewares/authen.middleware');
const postController = require('./post.controller');
const upload = require('../Middlewares/image_upload.middleware');

router.get('/images', authenMiddleware.isAuth, postController.getAllImageUser);
router.put('/images/:id', authenMiddleware.isAuth, postController.updateCapImage);
router.delete('/images/:id', authenMiddleware.isAuth, postController.deleteImage);

router.get("/:id/comments", authenMiddleware.isAuth, postController.getAllCmtDesc);
router.put("/:id/comments/:comment_id", authenMiddleware.isAuth, postController.updateComment);
router.delete("/:id/comments/:comment_id", authenMiddleware.isAuth, postController.deleteComment);
router.post("/:id/comments/:comment_id/like", authenMiddleware.isAuth, postController.likeComment);

router.get('/getUrlUpload', authenMiddleware.isAuth ,postController.uploadLink);
router.post('/', authenMiddleware.isAuth , postController.uploadPost);
router.post('/uploadImage',authenMiddleware.isAuth,upload,postController.uploadImage);
router.post('/:id/like', authenMiddleware.isAuth, postController.likePost );
router.post('/:id/comment', authenMiddleware.isAuth , postController.commentPost);
router.put('/:id', authenMiddleware.isAuth, postController.updatePost);
router.delete('/:id', authenMiddleware.isAuth, postController.deletePost);
router.get('/users/:id/post', authenMiddleware.isAuth, postController.listPost);


module.exports = router;
