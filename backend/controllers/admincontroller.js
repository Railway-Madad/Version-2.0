const adminModel = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookieHelper');

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    trainNo: z.string().min(1, "Train number is required")
});

const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const register = async (req, res) => {
    console.log("Register endpoint hit");
    const parsedBody = registerSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ errors: parsedBody.error.errors });
    }
    try {
        const { email, username, password, trainNo } = parsedBody.data;
        const existingAdmin = await adminModel.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await adminModel.create({ email, username, password: hashedPassword, trainNo });
        res.status(201).json({ message: "Admin registered successfully", adminId: newAdmin._id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const parsedBody = loginSchema.parse({ username, password });
        
        const admin = await adminModel.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ adminId: admin._id, trainNo: admin.trainNo }, process.env.JWT_SECRET, { expiresIn: '24h' });
        setAuthCookie(res, 'adminToken', token);
        res.status(200).json({ message: "Login successful", admin: { adminId: admin._id, username: admin.username, trainNo: admin.trainNo } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        clearAuthCookie(res, 'adminToken');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    login,
    logout
};