const express = require("express");
const router = express.Router();

router.get("/:locale", (req, res, next) => {
  const locale = req.params.locale;

  //Se establece una Cookie en el navegador
  res.cookie("nodeapp-locale", locale, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });

  //Responde con una redireccion
  res.redirect(req.get("referer"));
});

module.exports = router;
