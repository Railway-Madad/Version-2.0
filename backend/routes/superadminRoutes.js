const { Router } = require("express");
const superadminController = require("../controllers/superadmincontroller");

const superadminRouter = Router();

// Overall system stats
superadminRouter.get("/stats/system", superadminController.getSystemStats);

// All trains stats
superadminRouter.get("/stats/trains", superadminController.getAllTrainsStats);

// Performance metrics
superadminRouter.get("/stats/performance", superadminController.getTrainPerformanceMetrics);

// Complaint analysis
superadminRouter.get("/stats/complaints-analysis", superadminController.getComplaintAnalysis);

// Users management
superadminRouter.get("/users", superadminController.getAllUsers);
superadminRouter.get("/users/:userId", superadminController.getUserDetails);

// Staff management
superadminRouter.get("/staff", superadminController.getAllStaff);
superadminRouter.get("/staff/:staffId", superadminController.getStaffDetails);

// Admins management
superadminRouter.get("/admins", superadminController.getAllAdmins);
superadminRouter.get("/admins/:adminId", superadminController.getAdminDetails);

module.exports = superadminRouter;
