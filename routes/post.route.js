module.exports = app => {
    var router  = require('express').Router();
    const posts = require('../controllers/post.controller');


    
    app.use('/posts', router);
}