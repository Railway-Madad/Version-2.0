const {Router} = require('express');
const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const staffController = require('../controllers/staffcontroller');
const adminAuthentication = require('../middlewares/adminAuthentication');
const staffAuthentication = require('../middlewares/staffAuthentication');

const staffRouter = Router();

/**
 * @swagger
 * /staff/register:
 *   post:
 *     summary: Register staff
 *     tags: [Staff]
 *     responses:
 *       201:
 *         description: Staff registered
 */
staffRouter.post('/register', staffController.register);
/**
 * @swagger
 * /staff/login:
 *   post:
 *     summary: Login staff
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: Staff logged in
 */
staffRouter.post('/login', staffController.login);
/**
 * @swagger
 * /staff/logout:
 *   post:
 *     summary: Logout staff
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: Staff logged out
 */
staffRouter.post('/logout', staffController.logout);
/**
 * @swagger
 * /staff/complaints:
 *   get:
 *     summary: Get staff complaints
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 */
staffRouter.get('/complaints', staffAuthentication, staffController.getComplaints);
/**
 * @swagger
 * /staff/complaints/{id}/resolve:
 *   put:
 *     summary: Resolve complaint
 *     tags: [Staff]
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
 *         description: Complaint resolved
 */
staffRouter.put('/complaints/:id/resolve', staffAuthentication, staffController.resolveComplaint);
/**
 * @swagger
 * /staff/profile:
 *   get:
 *     summary: Get staff profile
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff profile
 */
staffRouter.get('/profile', staffAuthentication, staffController.getProfile);
/**
 * @swagger
 * /staff/getname/{id}:
 *   get:
 *     summary: Get staff name by ID
 *     tags: [Staff]
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
 *         description: Staff name details
 */
staffRouter.get('/getname/:id', staffAuthentication, staffController.getStaffById);
/**
 * @swagger
 * /staff/commands:
 *   get:
 *     summary: Get commands from admin
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of commands
 */
staffRouter.get('/commands', staffAuthentication, staffController.getMyCommands);
/**
 * @swagger
 * /staff/commands/{id}/read:
 *   put:
 *     summary: Mark command as read
 *     tags: [Staff]
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
 *         description: Command marked as read
 */
staffRouter.put('/commands/:id/read', staffAuthentication, staffController.markCommandRead);
staffRouter.get('/test', (req, res) => {
    res.send("Staff route is working in backend");
});

module.exports = staffRouter;