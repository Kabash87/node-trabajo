"use strict";
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/cursonode")
  .then(() => {})
  .catch((e) => {
    console.log("failed");
  });

//Estructura del Log In
const LogInSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

//Se conecta con la base de datos
const collection = new mongoose.model("users", LogInSchema);
module.exports = collection;
