"use strict";

const express = require("express");
const createError = require("http-errors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { isAPI } = require("./lib/utils");
const { error } = require("console");
require("./models"); // Connect DB & register models
const collection = require("./mongo");
const i18n = require("./lib/i18nConfig");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/**
 * Global Template variables
 */
app.locals.title = "NodePop";

/**
 * Middlewares
 * Cada petición será evaluada por ellos
 */

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(i18n.init); /**Cambiar idiomas */
app.use("/change-locale", require("./routes/change-locale"));

/**
 * Rutas del Api
 */
app.use("/", require("./routes/index"));
app.use("/anuncios", validateToken, require("./routes/anuncios"));

/**Rutas de Website */

app.get("/login", (req, res) => {
  res.render("login");
});

/**Auth  services*/
app.post("/auth", async (req, res) => {
  try {
    /**Se obtiene el Token del Usuario Iniciado */
    const check = await collection.findOne({ username: req.body.username });
    if (check.username === req.body.username) {
      if (check.password === req.body.password) {
        const { username } = req.body.username;
        const user = { username: username };
        const accessToken = generateAccessToken(user);
        res.send(
          /**Mensaje si el Usuario es encontrado  */
          `<center><div style='font-family: Helvetica;'>
          <br><h2>Authorized User</h2><h4>(Usuario Valido)</h4><h2>✅</h2><h4>Welcome back, ${check.username}</h4><p>Bienvenido de vuelta ${check.username}</p>
          <p>Token valido solo por 15 minutos</p><i>(Valid token only for 15 minutes)</i><br><br><button><a href='/anuncios?accesstoken=${accessToken}' 
          style='text-decoration: none;'>Enter</a></button><br><hr></div></center>`
        );
      } else {
        /**Mensaje si la Contraseña es Invalida */
        res.render("errorLogin");
      }
    } else {
      /**Mensaje si el Usuario es Incorrecto */
      res.render("errorLogin");
    }
  } catch {
    /**Mensaje si el Usuario es Inexistente */
    res.render("errorLogin");
  }
});

/**Validate Token */
function validateToken(req, res, next) {
  const accessToken = req.headers["authorization"] || req.query.accesstoken;
  if (!accessToken) {
    res.status(401).render("401");
  }

  jwt.verify(accessToken, process.env.SECRET, (err, user) => {
    if (err) {
      res.send(
        `<center><div style='font-family: Helvetica;'>
      <br><h2>Restricted access</h2><h4>(Acceso Restringido)</h4>
      <h2>⛔</h2><h4>Invalid or expired token</h4><p>Token Inválido o expirado</p>
      <p>Log in again</p><i>Inicie sesión nuevamente</i><br><br><button><a href='/login' 
      style='text-decoration: none;'>Enter</a></button><br><hr></div></center>`
      );
    } else {
      req.user = user;
      next();
    }
  });
}
function generateAccessToken(user) {
  return jwt.sign(user, process.env.SECRET, { expiresIn: "15M" });
}
/**
 * API v1 routes
 */
app.use("/apiv1/anuncios", require("./routes/apiv1/anuncios"));

/**
 * Error handlers
 */
// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err.array) {
    // validation error
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req)
      ? { message: "not valid", errors: err.mapped() }
      : `not valid - ${errInfo.param} ${errInfo.msg}`;
  }

  // establezco el status a la respuesta
  err.status = err.status || 500;
  res.status(err.status);

  // si es un 500 lo pinto en el log
  if (err.status && err.status >= 500) console.error(err);

  // si es una petición al API respondo JSON:

  if (isAPI(req)) {
    res.json({ error: err.message });
    return;
  }

  // ...y si no respondo con HTML:

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.render("error");
});

module.exports = app;
