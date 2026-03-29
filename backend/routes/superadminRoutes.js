const { Router } = require("express");
const superadminController = require("../controllers/superadmincontroller");

const superadminRouter = Router();

// Overall system stats
/**
 * @swagger
 * /superadmin/stats/system:
 *   get:
 *     summary: Get system stats
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: System stats
 */
superadminRouter.get("/stats/system", superadminController.getSystemStats);

// All trains stats
/**
 * @swagger
 * /superadmin/stats/trains:
 *   get:
 *     summary: Get trains stats
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: Trains stats
 */
superadminRouter.get("/stats/trains", superadminController.getAllTrainsStats);

// Performance metrics
/**
 * @swagger
 * /superadmin/stats/performance:
 *   get:
 *     summary: Get performance metrics
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: Performance metrics
 */
superadminRouter.get("/stats/performance", superadminController.getTrainPerformanceMetrics);

// Complaint analysis
/**
 * @swagger
 * /superadmin/stats/complaints-analysis:
 *   get:
 *     summary: Get complaint analysis
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: Complaint analysis
 */
superadminRouter.get("/stats/complaints-analysis", superadminController.getComplaintAnalysis);

// Users management
/**
 * @swagger
 * /superadmin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: List of users
 */
superadminRouter.get("/users", superadminController.getAllUsers);
/**
 * @swagger
 * /superadmin/users/{userId}:
 *   get:
 *     summary: Get user details
 *     tags: [Superadmin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
superadminRouter.get("/users/:userId", superadminController.getUserDetails);

// Staff management
/**
 * @swagger
 * /superadmin/staff:
 *   get:
 *     summary: Get all staff
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: List of staff
 */
superadminRouter.get("/staff", superadminController.getAllStaff);
/**
 * @swagger
 * /superadmin/staff/{staffId}:
 *   get:
 *     summary: Get staff details
 *     tags: [Superadmin]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff details
 */
superadminRouter.get("/staff/:staffId", superadminController.getStaffDetails);

// Admins management
/**
 * @swagger
 * /superadmin/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: List of admins
 */
superadminRouter.get("/admins", superadminController.getAllAdmins);
/**
 * @swagger
 * /superadmin/admins/{adminId}:
 *   get:
 *     summary: Get admin details
 *     tags: [Superadmin]
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin details
 */
superadminRouter.get("/admins/:adminId", superadminController.getAdminDetails);

module.exports = superadminRouter;
