const path = require("path");
const express = require("express");
const morgan = require("morgan");
const http = require("http");
const {requireTokenMiddleware, isLoggedIn} = require('./auth-middleware');
const chalk = require('chalk');
const app = express();
const server = http.createServer(app);
module.exports = server;

// logging middleware
app.use(morgan("dev"));

// static file-serving middleware
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
// body parsing middleware
app.use(express.json());

// auth and api routes
app.use("/auth", require("./auth"));
app.use("/api/game", require("./api/game"));

//GET / - sends our index file which loads the game
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/index.html"))
});

app.get("/game", async (req, res, next) => {
  const user = await isLoggedIn(req);
  if(user) {
    res.sendFile(path.join(__dirname, "..", "public/index.html"))
  }
  else {
    console.log(chalk.red('Unlogged in user trying to access game - redirecting to login'));
    res.redirect('/');
  }
});

// any remaining requests with an extension (.js, .css, etc.) send 404
app.use((req, res, next) => {
  if (path.extname(req.path).length) {
    const err = new Error("Not found");
    err.status = 404;
    next(err);
  } else {
    next();
  }
});

// sends index.html
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public/index.html"));
});

// error handling endware
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});
