const express    = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(
    bodyParser.urlencoded({ 
        extended: true 
    })
);

//Use routes
// require('./routes/user.route')(app);
// require('./routes/post.route')(app);
// require('./routes/image.route')(app);
// require('./routes/comment.route')(app);

//CONFIGURE PATH
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    try {
        console.log(`Server is running at port ${PORT}.`);
    } catch (err) {
        console.log('Error in server setup. ', err);
    }
});
