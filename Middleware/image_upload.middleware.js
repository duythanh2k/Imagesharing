const multer = require('multer');
const path = require('path');
var imagePath;
const storage = multer.diskStorage({
<<<<<<< HEAD
  destination: function (req, file, cb, next) {
    imagePath = path.join(path.dirname(__dirname), 'Images');
    cb(null, imagePath);
=======
  destination: function (req, file, cb,next) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      imagePath = path.join(path.dirname(__dirname), "Images");
      cb(null, imagePath)
    } else {
      //Reject image
      callback("Image is only png/jpg/jpeg", false)
    }
>>>>>>> 47a4528e7baf160cc5685ba7579c4b9775e5f666
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array('image', 15);

module.exports = upload;
