const adminModel = require('../models/adminModel');
const staffModel = require('../models/staffModel');
const complaintModel = require('../models/complaintModel');
const cateringModel = require('../models/cateringModel');
const commandModel = require('../models/commandModel');
const trainModel = require('../models/trainModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookieHelper');

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
    console.log("Register endpoint hit");
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
        const { username, password, trainNo } = req.body;
        
        if (!username || !password || !trainNo) {
            return res.status(400).json({ message: "Username, password, and train number are required" });
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

        const token = jwt.sign({ adminId: admin._id, trainNo }, process.env.JWT_SECRET, { expiresIn: '24h' });
        setAuthCookie(res, 'adminToken', token);
        res.status(200).json({ message: "Login successful", admin: { adminId: admin._id, username: admin.username, trainNo } });
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

// ── GET staff for admin's current train ──
const getTrainStaff = async (req, res) => {
    try {
        const trainNo = req.trainNo;
        const staff = await staffModel.find({ trainNumber: trainNo }).select('-password');
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── UPDATE staff details (trainNumber, role, phone etc.) ──
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { trainNumber, role, phone, name } = req.body;

        const staff = await staffModel.findById(id);
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        if (trainNumber) staff.trainNumber = trainNumber;
        if (role) staff.role = role;
        if (phone) staff.phone = phone;
        if (name) staff.name = name;
        staff.updatedAt = Date.now();

        await staff.save();
        res.status(200).json({ success: true, message: "Staff updated", data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── DELETE staff ──
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await staffModel.findByIdAndDelete(id);
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, message: "Staff deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── GET complaints for admin's train ──
const getTrainComplaints = async (req, res) => {
    try {
        const trainNo = req.trainNo;
        const { status, domain } = req.query;
        const filter = { trainNumber: trainNo };
        if (status) filter.status = status;
        if (domain) filter.issueDomain = domain;

        const complaints = await complaintModel.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: complaints });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── GET catering orders for admin's train ──
const getTrainOrders = async (req, res) => {
    try {
        const trainNo = req.trainNo;
        const { status } = req.query;
        const filter = { trainNumber: trainNo };
        if (status) filter.status = status;

        const orders = await cateringModel.find(filter)
            .sort({ createdAt: -1 })
            .populate("user", "name email")
            .populate("items.foodItem", "name price");
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── SEND command/notice to a staff member ──
const sendCommand = async (req, res) => {
    try {
        const { staffId, title, message, priority } = req.body;
        if (!staffId || !title || !message) {
            return res.status(400).json({ success: false, message: "staffId, title and message are required" });
        }

        const command = await commandModel.create({
            adminId: req.adminId,
            staffId,
            trainNumber: req.trainNo,
            title,
            message,
            priority: priority || 'medium'
        });

        res.status(201).json({ success: true, data: command });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── GET all commands sent by admin for this train ──
const getTrainCommands = async (req, res) => {
    try {
        const trainNo = req.trainNo;
        const commands = await commandModel.find({ trainNumber: trainNo })
            .sort({ createdAt: -1 })
            .populate('staffId', 'name role email');
        res.status(200).json({ success: true, data: commands });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── DELETE a command ──
const deleteCommand = async (req, res) => {
    try {
        const { id } = req.params;
        const command = await commandModel.findByIdAndDelete(id);
        if (!command) {
            return res.status(404).json({ success: false, message: "Command not found" });
        }
        res.status(200).json({ success: true, message: "Command deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── ADD a new train number ──
const addTrain = async (req, res) => {
    try {
        const { trainNumber } = req.body;
        if (!trainNumber) {
            return res.status(400).json({ success: false, message: "trainNumber is required" });
        }
        const exists = await trainModel.findOne({ trainNumber });
        if (exists) {
            return res.status(400).json({ success: false, message: "Train number already exists" });
        }
        const train = await trainModel.create({ trainNumber });
        res.status(201).json({ success: true, data: train });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── GET dashboard summary stats ──
const getDashboardStats = async (req, res) => {
    try {
        const trainNo = req.trainNo;
        const [staffCount, pendingComplaints, totalComplaints, totalOrders, pendingOrders] = await Promise.all([
            staffModel.countDocuments({ trainNumber: trainNo }),
            complaintModel.countDocuments({ trainNumber: trainNo, status: { $ne: 'Resolved' } }),
            complaintModel.countDocuments({ trainNumber: trainNo }),
            cateringModel.countDocuments({ trainNumber: trainNo }),
            cateringModel.countDocuments({ trainNumber: trainNo, status: { $nin: ['delivered', 'cancelled'] } }),
        ]);

        res.status(200).json({
            success: true,
            data: { staffCount, pendingComplaints, totalComplaints, totalOrders, pendingOrders, trainNo }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    getTrainStaff,
    updateStaff,
    deleteStaff,
    getTrainComplaints,
    getTrainOrders,
    sendCommand,
    getTrainCommands,
    deleteCommand,
    addTrain,
    getDashboardStats
};