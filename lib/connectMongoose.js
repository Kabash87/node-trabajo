"use strict";

const mongoose = require("mongoose");

mongoose.connection.on("error", function (err) {
  console.error("mongodb connection error:", err);
  process.exit(1);
});

mongoose.connection.once("open", function () {
  console.info("Connected to mongodb.");
});

const connectionPromise = mongoose.connect(
  "mongodb://127.0.0.1:27017/cursonode",
  {
    useUnifiedTopology: true,
  }
);
