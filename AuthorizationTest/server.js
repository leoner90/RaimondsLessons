//LIBRARIES
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const server = express();

//SESSION LIBRARIES AND START
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
server.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
server.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

//CONTROLLERS
const Authorisation = require("./app/controllers/AuthorisationController");
const AuthorisationCtrl = new Authorisation();

//BASE SERVER SETUP
server.use(express.json())
server.set("view engine", "ejs"); // set templating engine
server.set("views", path.resolve(__dirname, "app/views"));// change default location of templating engine views
server.use(express.static(path.resolve(__dirname, "assets")));// us of main css in assets
server.use(bodyParser.urlencoded({ extended: false }));// used to parse req.body for POST,PUT requests

//GET PAGES
server.get("/", function (req, res) { res.render("pages/index");});
server.get("/reg", function (req, res) {
  AuthorisationCtrl.regNewUser(req, res);
})
server.get("/login", function (req, res) {
  AuthorisationCtrl.logIn(req, res);
})

//POST PAGES
server.post("/reg", function (req, res) {
  AuthorisationCtrl.RegPost(req, res);
})
server.post("/login", function (req, res) {
  AuthorisationCtrl.logInPost(req, res);
})
server.post("/logOut", AuthorisationCtrl.logOut);

//ERROR PAGE
server.use("*", function (req, res) {
  res.render("pages/error");
});

//START SERVER LISTENER
const port = 3000;
server.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});