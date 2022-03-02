const express    = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(
    bodyParser.urlencoded({ 
        extended: true 
    })
);

// app.get('/', (req, res) => {
//     res.json({greeting: "Hello!"});
// });

//CONFIGURE PATH
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    try {
        console.log(`Server is running at port ${PORT}.`);
    } catch (err) {
        console.log('Error in server setup. ', err);
    }
});
