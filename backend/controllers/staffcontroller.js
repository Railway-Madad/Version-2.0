const staffModel = require('../models/staffModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z, email } = require('zod');
const Complaint = require('../models/complaintModel');

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
    phone: z.string().min(10, "Phone number must be at least 10 digits long")

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
        const { name, role, email, password, phone } = parsedBody.data;
        const existingStaff = await staffModel.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStaff = await staffModel.create({ name, role, email, password: hashedPassword, phone });
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
        const { email, password } = loginSchema.parse(req.body);

        const staff = await staffModel.findOne({ email });
        if (!staff) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, staff.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ staffId: staff._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
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
        const staff = await staffModel.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        // Fetch complaints assigned to the staff's role from complaintModel using issueDomain fields ie 

        const complaints = await Complaint.find({ issueDomain: staff.role}).sort({ createdAt: -1 });
        
        res.status(200).json({ complaints });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    getComplaints
};