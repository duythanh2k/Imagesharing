const express = require('express');
const router = express.Router();

const authenMiddleware = require('../Middleware/authen.middleware');
const postController = require('../controllers/post.controller');
const upload = require('../Middleware/image_upload.middleware');

router.get('/images', authenMiddleware.isAuth, postController.getAllImageUser);
router.put(
  '/images/:id',
  authenMiddleware.isAuth,
  postController.updateCapImage
);
router.delete(
  '/images/:id',
  authenMiddleware.isAuth,
  postController.deleteImage
);

router.get(
  '/:id/comments',
  authenMiddleware.isAuth,
  postController.getAllCmtDesc
);
router.delete(
  '/:id/comments/:comment_id',
  authenMiddleware.isAuth,
  postController.deleteComment
);
router.post(
  '/:id/comments/:comment_id/like',
  authenMiddleware.isAuth,
  postController.likeComment
);

router.get(
  '/upload',
  authenMiddleware.isAuth,
  upload,
  postController.uploadImage
);
router.post('/', authenMiddleware.isAuth, postController.uploadPost);
router.post('/:id/like', authenMiddleware.isAuth, postController.likePost);
router.post(
  '/:id/comment',
  authenMiddleware.isAuth,
  postController.commentPost
);
router.put('/:id', authenMiddleware.isAuth, postController.updatePost);
router.delete('/:id', authenMiddleware.isAuth, postController.deletePost);
router.get('/users/:id/post', authenMiddleware.isAuth, postController.listPost);

module.exports = router;
