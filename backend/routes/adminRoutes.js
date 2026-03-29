const {Router} = require('express');
const adminController = require('../controllers/admincontroller');
const adminAuthentication = require('../middlewares/adminAuthentication');

const adminRouter = Router();

// Auth
/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Register an admin
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Admin registered
 */
adminRouter.post('/register', adminController.register);
/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login an admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin logged in
 */
adminRouter.post('/login', adminController.login);
/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Logout an admin
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin logged out
 */
adminRouter.post('/logout', adminController.logout);

// Dashboard stats (no auth required for now)
/**
 * @swagger
 * /admin/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
adminRouter.get('/dashboard-stats', adminController.getDashboardStats);
/**
 * @swagger
 * /admin/train-statistics:
 *   get:
 *     summary: Get train statistics
 *     tags: [Admin Dashboard]
 *     responses:
 *       200:
 *         description: Train stats
 */
adminRouter.get('/train-statistics', adminController.getTrainStatistics);

// Staff management
/**
 * @swagger
 * /admin/train-staff:
 *   get:
 *     summary: Get train staff
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of train staff
 */
adminRouter.get('/train-staff', adminAuthentication, adminController.getTrainStaff);
/**
 * @swagger
 * /admin/staff/{id}:
 *   put:
 *     summary: Update staff
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff updated
 */
adminRouter.put('/staff/:id', adminAuthentication, adminController.updateStaff);
/**
 * @swagger
 * /admin/staff/{id}:
 *   delete:
 *     summary: Delete staff
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted
 */
adminRouter.delete('/staff/:id', adminAuthentication, adminController.deleteStaff);

// Complaints for the train
/**
 * @swagger
 * /admin/train-complaints:
 *   get:
 *     summary: Get train complaints
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 */
adminRouter.get('/train-complaints', adminAuthentication, adminController.getTrainComplaints);

// Catering orders for the train
/**
 * @swagger
 * /admin/train-orders:
 *   get:
 *     summary: Get train orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
adminRouter.get('/train-orders', adminAuthentication, adminController.getTrainOrders);

// Commands / notices to staff
/**
 * @swagger
 * /admin/commands:
 *   post:
 *     summary: Send command to staff
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Command sent
 */
adminRouter.post('/commands', adminAuthentication, adminController.sendCommand);
/**
 * @swagger
 * /admin/commands:
 *   get:
 *     summary: Get all commands
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of commands
 */
adminRouter.get('/commands', adminAuthentication, adminController.getTrainCommands);
/**
 * @swagger
 * /admin/commands/{id}:
 *   delete:
 *     summary: Delete command
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Command deleted
 */
adminRouter.delete('/commands/:id', adminAuthentication, adminController.deleteCommand);

// Train management
/**
 * @swagger
 * /admin/trains:
 *   post:
 *     summary: Add train
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Train added
 */
adminRouter.post('/trains', adminAuthentication, adminController.addTrain);

// All data endpoints (for analytics - no auth required for now)
/**
 * @swagger
 * /admin/all-orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin Analytics]
 *     responses:
 *       200:
 *         description: List of all orders
 */
adminRouter.get('/all-orders', adminController.getAllOrdersAll);
/**
 * @swagger
 * /admin/all-complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Admin Analytics]
 *     responses:
 *       200:
 *         description: List of all complaints
 */
adminRouter.get('/all-complaints', adminController.getAllComplaintsAll);
/**
 * @swagger
 * /admin/all-lostnfound:
 *   get:
 *     summary: Get all lost and found
 *     tags: [Admin Analytics]
 *     responses:
 *       200:
 *         description: List of all lost and found items
 */
adminRouter.get('/all-lostnfound', adminController.getAllLostFoundAll);
/**
 * @swagger
 * /admin/lostnfound/{id}/status:
 *   put:
 *     summary: Update lost and found status
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
adminRouter.put('/lostnfound/:id/status', adminAuthentication, adminController.updateLostFoundStatus);
/**
 * @swagger
 * /admin/all-staff:
 *   get:
 *     summary: Get all staff
 *     tags: [Admin Analytics]
 *     responses:
 *       200:
 *         description: List of all staff
 */
adminRouter.get('/all-staff', adminController.getAllStaffAll);

adminRouter.get('/test', adminAuthentication, (req, res) => {
    res.send("Admin route is working");
});

module.exports = adminRouter;