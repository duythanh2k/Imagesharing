module.exports = app => {
    var router  = require('express').Router();
    const posts = require('../controllers/comment.controller');


    
    app.use('/comments', router);
}
