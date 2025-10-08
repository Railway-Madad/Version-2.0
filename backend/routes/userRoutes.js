const {Router} = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usercontroller = require("../controllers/usercontroller");
const userAuthentication = require("../middlewares/userAuthentication");

const userRouter = Router();

userRouter.post("/register", usercontroller.register);
userRouter.post("/login", usercontroller.login);
userRouter.get("/profile", userAuthentication, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
userRouter.get('/test', userAuthentication, (req, res) => {
    res.send("User route is working");
});

module.exports = userRouter;