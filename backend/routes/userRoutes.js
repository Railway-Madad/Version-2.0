const {Router} = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usercontroller = require("../controllers/usercontroller");
const userAuthentication = require("../middlewares/userAuthentication");

const userRouter = Router();

userRouter.post("/register", usercontroller.register);
userRouter.post("/login", usercontroller.login);
userRouter.get('/test', userAuthentication, (req, res) => {
    res.send("User route is working");
});

module.exports = userRouter;