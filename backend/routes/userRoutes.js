const {Router} = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usercontroller = require("../controllers/usercontroller");
const userAuthentication = require("../middlewares/userAuthentication");

const userRouter = Router();

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
userRouter.post("/register", usercontroller.register);
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
userRouter.post("/login", usercontroller.login);
/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logout successful
 */
userRouter.post("/logout", usercontroller.logout);
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *       404:
 *         description: User not found
 */
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