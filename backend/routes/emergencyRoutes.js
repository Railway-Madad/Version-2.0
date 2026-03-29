const express = require('express');
const router = express.Router();
const { createEmergency, getallEmergencies, getAdminEmergencies, markEmergencyInProcess, resolveEmergency, getUserEmergencies } = require('../controllers/emergencyController');
const userAuthentication = require("../middlewares/userAuthentication");
const adminAuthentication = require("../middlewares/adminAuthentication");

/**
 * @swagger
 * /emergency/postEmg:
 *   post:
 *     summary: Create an emergency
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Emergency created
 */
router.post('/postEmg', userAuthentication, createEmergency);
/**
 * @swagger
 * /emergency/getEmg:
 *   get:
 *     summary: Get all emergencies
 *     tags: [Emergency]
 *     responses:
 *       200:
 *         description: List of emergencies
 */
router.get('/getEmg', getallEmergencies);
/**
 * @swagger
 * /emergency/my-emergencies:
 *   get:
 *     summary: Get my emergencies
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's emergencies
 */
router.get('/my-emergencies', userAuthentication, getUserEmergencies);
/**
 * @swagger
 * /emergency/admin/getEmg:
 *   get:
 *     summary: Get emergencies for admin
 *     tags: [Emergency]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of emergencies
 */
router.get('/admin/getEmg', adminAuthentication, getAdminEmergencies);
/**
 * @swagger
 * /emergency/{id}/inprocess:
 *   put:
 *     summary: Mark emergency as in process
 *     tags: [Emergency]
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
router.put('/:id/inprocess', adminAuthentication, markEmergencyInProcess);
/**
 * @swagger
 * /emergency/{id}/resolve:
 *   put:
 *     summary: Resolve an emergency
 *     tags: [Emergency]
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
 *         description: Emergency resolved
 */
router.put('/:id/resolve', userAuthentication, resolveEmergency);

module.exports = router;