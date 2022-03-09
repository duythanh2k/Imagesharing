const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config;

const app = express();
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Routes configuration
const users = require("./routes/user.route");
const posts = require("./routes/post.route");

//Using route
app.use("/", users);
app.use("/posts", posts);

//PORT set up
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  try {
    console.log(`Server is running at port ${PORT}.`);
  } catch (err) {
    console.log("Error in server setup. ", err);
  }
});
