const staffModel = require('../models/staffModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z, email } = require('zod');
const Complaint = require('../models/complaintModel');
const complaintModel = require('../models/complaintModel');
const commandModel = require('../models/commandModel');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookieHelper');
const { paginateModel } = require('../utils/pagination');

const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    role: z.enum(['Cleaning', 'Catering', 'Security', 'Maintenance', 'Medical'], {
        errorMap: (issue, ctx) => {
            if (issue.code === 'invalid_enum_value') {
                return { message: `Role must be one of: ${ctx.enum.join(', ')}` };
            }
            return { message: 'Invalid role' };
        }
    }),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone: z.string().min(10, "Phone number must be at least 10 digits long"),
    trainNumber: z.string().min(1, "Train number is required")
});
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const register = async (req, res) => {
    const parsedBody = registerSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ errors: parsedBody.error.errors });
    }
    try {
        const { name, role, email, password, phone, trainNumber } = parsedBody.data;
        const existingStaff = await staffModel.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStaff = await staffModel.create({ name, role, email, password: hashedPassword, phone, trainNumber });
        res.status(201).json({ message: "Staff registered successfully", staffId: newStaff._id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, trainNo } = req.body;
        
        // Validate required fields
        if (!email || !password || !trainNo) {
            return res.status(400).json({ message: "Email, password, and train number are required" });
        }

        const parsedBody = loginSchema.parse({ email, password });

        const staff = await staffModel.findOne({ email });
        if (!staff) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, staff.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Update train number in database if it changed
        if (staff.trainNumber !== trainNo) {
            staff.trainNumber = trainNo;
            await staff.save();
        }

        const token = jwt.sign({ staffId: staff._id, trainNo }, process.env.JWT_SECRET, { expiresIn: '24h' });
        setAuthCookie(res, 'staffToken', token);
        res.status(200).json({ message: "Login successful", staff: { staffId: staff._id, email: staff.email, role: staff.role, trainNo } });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const getProfile = async (req, res) => {
    try {
        const staffId = req.staffId;
        const staff = await staffModel.findById(staffId).select('-password'); // Exclude password
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.status(200).json({ staff });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getComplaints = async (req, res) => {
    try {
        const staffId = req.staffId;
        const trainNo = req.trainNo;
        const staff = await staffModel.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        // Fetch complaints assigned to the staff's role AND train number
        const filter = {
            issueDomain: staff.role,
            trainNumber: trainNo
        };

        const result = await paginateModel({
            model: Complaint,
            query: req.query,
            filter,
            sort: { createdAt: -1 },
        });

        res.status(200).json({
            complaints: result.data,
            hasMore: result.hasMore,
            nextPage: result.nextPage || null,
            nextCursor: result.nextCursor || null,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getStaffById = async (req, res) => {
    try {
        const staffId = req.params.id;
        const staff = await staffModel.findById(staffId).select('name role email phone'); // Exclude password
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.status(200).json({ staff });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const resolveComplaint = async (req, res) => {
    try {
        const staffId = req.staffId;
        const { id } = req.params;
        const { resolutionDetails } = req.body;

        const staff = await staffModel.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        const complaint = await Complaint.findById(id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (complaint.status === 'Resolved') {
            return res.status(400).json({ message: "Complaint is already resolved" });
        }

        // Check if the complaint's issueDomain matches the staff's role
        if (complaint.issueDomain !== staff.role) {
            return res.status(403).json({ message: "You are not authorized to resolve this complaint" });
        }

        complaint.status = 'AwaitingConfirmation';
        complaint.resolvedAt = new Date();
        complaint.resolutionDetails = resolutionDetails || '';
        complaint.resolvedBy = staff._id;

        const updatedComplaint = await complaintModel.findByIdAndUpdate(id, complaint, { new: true });

        res.status(200).json({ message: "Complaint resolved successfully", complaint: updatedComplaint });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        clearAuthCookie(res, 'staffToken');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ── GET commands/notices for the logged-in staff ──
const getMyCommands = async (req, res) => {
    try {
        const staffId = req.staffId;
        const result = await paginateModel({
            model: commandModel,
            query: req.query,
            filter: { staffId },
            sort: { createdAt: -1 },
        });

        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ── Mark a command as read ──
const markCommandRead = async (req, res) => {
    try {
        const { id } = req.params;
        const command = await commandModel.findOneAndUpdate(
            { _id: id, staffId: req.staffId },
            { isRead: true },
            { new: true }
        );
        if (!command) {
            return res.status(404).json({ success: false, message: "Command not found" });
        }
        res.status(200).json({ success: true, data: command });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    getComplaints,
    resolveComplaint,
    getStaffById,
    getMyCommands,
    markCommandRead
};