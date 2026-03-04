const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Staff = require("../models/staffModel");
const Complaint = require("../models/complaintModel");
const Catering = require("../models/cateringModel");
const LostNFound = require("../models/lostnfoundModel");
const Emergency = require("../models/emergencyModel");
const Feedback = require("../models/feedbackModel");
const News = require("../models/NewsModel");
const Train = require("../models/trainModel");

// Get all trains stats
const getAllTrainsStats = async (req, res) => {
    try {
        const trains = await Train.find({});
        
        const stats = await Promise.all(trains.map(async (train) => {
            const trainNumber = train.trainNumber;
            
            return {
                trainNumber,
                users: await User.countDocuments({ trainNumber }),
                staff: await Staff.countDocuments({ trainNumber }),
                complaints: {
                    total: await Complaint.countDocuments({ trainNumber }),
                    pending: await Complaint.countDocuments({ trainNumber, status: 'pending' }),
                    resolved: await Complaint.countDocuments({ trainNumber, status: 'resolved' })
                },
                orders: {
                    total: await Catering.countDocuments({ trainNumber }),
                    pending: await Catering.countDocuments({ trainNumber, status: 'pending' }),
                    delivered: await Catering.countDocuments({ trainNumber, status: 'delivered' }),
                    cancelled: await Catering.countDocuments({ trainNumber, status: 'cancelled' })
                },
                emergencies: {
                    total: await Emergency.countDocuments({ trainNumber }),
                    pending: await Emergency.countDocuments({ trainNumber, status: 'pending' }),
                    responded: await Emergency.countDocuments({ trainNumber, status: 'responded' })
                },
                lostNFound: {
                    total: await LostNFound.countDocuments({ trainNumber }),
                    lost: await LostNFound.countDocuments({ trainNumber, type: 'lost' }),
                    found: await LostNFound.countDocuments({ trainNumber, type: 'found' }),
                    claimed: await LostNFound.countDocuments({ trainNumber, claimed: true })
                },
                feedback: await Feedback.countDocuments({ trainNumber })
            };
        }));

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get overall system stats
const getSystemStats = async (req, res) => {
    try {
        const stats = {
            users: await User.countDocuments(),
            staff: await Staff.countDocuments(),
            trains: await Train.countDocuments(),
            complaints: {
                total: await Complaint.countDocuments(),
                pending: await Complaint.countDocuments({ status: 'pending' }),
                resolved: await Complaint.countDocuments({ status: 'resolved' })
            },
            orders: {
                total: await Catering.countDocuments(),
                pending: await Catering.countDocuments({ status: 'pending' }),
                delivered: await Catering.countDocuments({ status: 'delivered' }),
                cancelled: await Catering.countDocuments({ status: 'cancelled' })
            },
            emergencies: {
                total: await Emergency.countDocuments(),
                pending: await Emergency.countDocuments({ status: 'pending' }),
                responded: await Emergency.countDocuments({ status: 'responded' })
            },
            lostNFound: {
                total: await LostNFound.countDocuments(),
                lost: await LostNFound.countDocuments({ type: 'lost' }),
                found: await LostNFound.countDocuments({ type: 'found' }),
                claimed: await LostNFound.countDocuments({ claimed: true })
            },
            feedback: await Feedback.countDocuments(),
            news: await News.countDocuments()
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get all users with their details
const getAllUsers = async (req, res) => {
    try {
        const { trainNumber, page = 1, limit = 10 } = req.query;
        
        const query = trainNumber ? { trainNumber } : {};
        const skip = (page - 1) * limit;
        
        const users = await User.find(query)
            .select("-password")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const total = await User.countDocuments(query);
        
        res.status(200).json({ 
            success: true, 
            data: users,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get user details with all their related data
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        
        const userStats = {
            user,
            complaints: await Complaint.find({ userId }).sort({ createdAt: -1 }),
            orders: await Catering.find({ user: userId }).sort({ createdAt: -1 }),
            emergencies: await Emergency.find({ userId }).sort({ createdAt: -1 }),
            lostNFound: await LostNFound.find({ reportedBy: userId }).sort({ createdAt: -1 })
        };
        
        res.status(200).json({ success: true, data: userStats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get all staff with their details
const getAllStaff = async (req, res) => {
    try {
        const { trainNumber, page = 1, limit = 10, role } = req.query;
        
        const query = {};
        if (trainNumber) query.trainNumber = trainNumber;
        if (role) query.role = role;
        
        const skip = (page - 1) * limit;
        
        const staff = await Staff.find(query)
            .select("-password")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const total = await Staff.countDocuments(query);
        
        res.status(200).json({ 
            success: true, 
            data: staff,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get staff details with their assigned work
const getStaffDetails = async (req, res) => {
    try {
        const { staffId } = req.params;
        
        const staff = await Staff.findById(staffId).select("-password");
        if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
        
        const staffStats = {
            staff,
            complaintsAssigned: await Complaint.countDocuments({ 
                issueDomain: staff.role,
                trainNumber: staff.trainNumber 
            }),
            ordersHandled: {
                total: await Catering.countDocuments({ trainNumber: staff.trainNumber }),
                pending: await Catering.countDocuments({ trainNumber: staff.trainNumber, status: 'pending' }),
                delivered: await Catering.countDocuments({ trainNumber: staff.trainNumber, status: 'delivered' })
            },
            emergenciesReceived: await Emergency.countDocuments({ trainNumber: staff.trainNumber })
        };
        
        res.status(200).json({ success: true, data: staffStats });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get performance metrics by train
const getTrainPerformanceMetrics = async (req, res) => {
    try {
        const trains = await Train.find({});
        
        const metrics = await Promise.all(trains.map(async (train) => {
            const trainNumber = train.trainNumber;
            const complaints = await Complaint.find({ trainNumber });
            const orders = await Catering.find({ trainNumber });
            
            const complaintResolutionRate = complaints.length > 0 
                ? ((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100).toFixed(2)
                : 0;
            
            const orderDeliveryRate = orders.length > 0
                ? ((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(2)
                : 0;
            
            return {
                trainNumber,
                complaintResolutionRate: parseFloat(complaintResolutionRate),
                orderDeliveryRate: parseFloat(orderDeliveryRate),
                averageOrderValue: orders.reduce((sum, o) => sum + o.totalPrice, 0) / (orders.length || 1),
                totalFeedbackScore: await Feedback.aggregate([
                    { $match: { trainNumber } },
                    { $group: { _id: null, avg: { $avg: "$rating" } } }
                ])
            };
        }));

        res.status(200).json({ success: true, data: metrics });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get complaint analysis by domain and train
const getComplaintAnalysis = async (req, res) => {
    try {
        const trains = await Train.find({});
        
        const analysis = await Promise.all(trains.map(async (train) => {
            const domains = ['Cleaning', 'Catering', 'Security', 'Maintenance', 'Medical'];
            const domainStats = await Promise.all(domains.map(async (domain) => {
                return {
                    domain,
                    total: await Complaint.countDocuments({ trainNumber: train.trainNumber, issueDomain: domain }),
                    resolved: await Complaint.countDocuments({ trainNumber: train.trainNumber, issueDomain: domain, status: 'resolved' }),
                    pending: await Complaint.countDocuments({ trainNumber: train.trainNumber, issueDomain: domain, status: 'pending' })
                };
            }));
            
            return { trainNumber: train.trainNumber, domains: domainStats };
        }));

        res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllTrainsStats,
    getSystemStats,
    getAllUsers,
    getUserDetails,
    getAllStaff,
    getStaffDetails,
    getTrainPerformanceMetrics,
    getComplaintAnalysis
};
