const express = require('express');
const router  = express.Router();

const authenMiddleware = require('../Middleware/authen.middleware');
const postController   = require('../controllers/post.controller');

router.get('/images', authenMiddleware.isAuth, postController.getAllImageUser);
router.put('/images/:id', authenMiddleware.isAuth, postController.updateCapImage);
router.delete('/images/:id', authenMiddleware.isAuth, postController.deleteImage);

router.get("/:id/comments", auth.isAuth, posts.getAllCmtDesc);
router.delete("/:id/comments/:comment_id", auth.isAuth, posts.deleteComment);
router.post("/:id/comments/:comment_id/like", auth.isAuth, posts.likeComment);

module.exports = router;
