const multer = require("multer");
const path = requre("node:path");

//Se declara la configuracion de Upload
const storange = multer.diskStorage({
  destination: function (req, file, cb) {
    const ruta = path.join(__dirname, "..", "uploads");
    cb(null, ruta);
  },
  filename: function (req, file, cb) {
    const filename =
      file.fieldname + "-" + Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storange });

module.exports = upload;
