const multer = require("multer")
const path = require('path');
var imagePath;
const storage = multer.diskStorage({
  destination: function (req, file, cb,next) {
    imagePath = path.join(path.dirname(__dirname), "Images")
    cb(null, imagePath)
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage }).array('image', 15);

module.exports = upload;