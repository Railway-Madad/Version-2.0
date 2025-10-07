const adminModel = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const register = async (req, res) => {
    const parsedBody = registerSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ errors: parsedBody.error.errors });
    }
    try {
        const { email, username, password } = parsedBody.data;
        const existingAdmin = await adminModel.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await adminModel.create({ email, username, password: hashedPassword });
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
        const { username, password } = loginSchema.parse(req.body);

        const admin = await adminModel.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    login
};