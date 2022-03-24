const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config;
const swaggerUI=require('swagger-ui-express');
const YAML=require('yamljs');
const swaggerDoc = YAML.load("./swagger-output.yaml");
const app = express();
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Routes configuration
const users = require("./routes/user.route");
const posts=require('./routes/post.route')

//Using route
app.use("/posts", posts);
app.use("/", users);
app.use('/',swaggerUI.serve,swaggerUI.setup(swaggerDoc));

//PORT set up
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  try {
    console.log(`Server is running at port ${PORT}.`);
  } catch (err) {
    console.log("Error in server setup. ", err);
  }
});
