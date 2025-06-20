const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: "src/upload",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


const singleupload = multer({ storage }).single("image");

module.exports = singleupload;
