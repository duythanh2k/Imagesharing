const express =require('express');
const router = express.Router();

const authenMiddleware = require('../Middleware/authen.middleware');
const postController=require('../controllers/post.controller');
router.get('/images', authenMiddleware.isAuth, postController.getAllImageUser);
router.put('/images/:id', authenMiddleware.isAuth, postController.updateCapImage);
router.delete('/images/:id', authenMiddleware.isAuth, postController.deleteImage);

    
module.exports = router
