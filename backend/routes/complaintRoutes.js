const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const multer = require('multer');
const userAuthentication = require("../middlewares/userAuthentication");
const adminAuthentication = require('../middlewares/adminAuthentication');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
/**
 * @swagger
 * /complaint:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 */
router.get('/',userAuthentication, complaintController.getAllComplaints);
/**
 * @swagger
 * /complaint/submit-complaint:
 *   post:
 *     summary: Submit a complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Complaint submitted
 */
router.post('/submit-complaint',userAuthentication, upload.single('image'), complaintController.postComplaint);
/**
 * @swagger
 * /complaint/my-complaints-history:
 *   get:
 *     summary: Get my complaints history
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Complaint history
 */
router.get('/my-complaints-history',userAuthentication, complaintController.getMyAllComplaints);
/**
 * @swagger
 * /complaint/api/complaints/user/{username}:
 *   get:
 *     summary: Get complaints by user
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User complaints
 */
router.get('/api/complaints/user/:username',userAuthentication, complaintController.getComplaintsByUser);
/**
 * @swagger
 * /complaint/api/complaints/resolve/{id}:
 *   put:
 *     summary: Resolve a complaint
 *     tags: [Complaints]
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
router.put('/api/complaints/resolve/:id/',adminAuthentication, complaintController.resolveComplaint);
/**
 * @swagger
 * /complaint/api/complaints/{domain}:
 *   get:
 *     summary: Get complaints by domain
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domain complaints
 */
router.get('/api/complaints/:domain',userAuthentication, complaintController.getComplaintsByDomain);
/**
 * @swagger
 * /complaint/api/complaints/{id}:
 *   delete:
 *     summary: Delete a complaint
 *     tags: [Complaints]
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
 *         description: Complaint deleted
 */
router.delete('/api/complaints/:id',userAuthentication, complaintController.deleteComplaint);
/**
 * @swagger
 * /complaint/complaints/all:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all complaints
 */
router.get('/complaints/all',userAuthentication, complaintController.getAllComplaints);
/**
 * @swagger
 * /complaint/api/images/user/{username}:
 *   get:
 *     summary: Get images by user
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Images
 */
router.get('/api/images/user/:username',userAuthentication, complaintController.getImagesByUser);
/**
 * @swagger
 * /complaint/api/complaintsIMP:
 *   get:
 *     summary: Get important complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Important complaints
 */
router.get('/api/complaintsIMP',adminAuthentication, complaintController.getComplaintByStatus);
/**
 * @swagger
 * /complaint/api/complaintsRES:
 *   get:
 *     summary: Get pending complaints
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending complaints
 */
router.get('/api/complaintsRES',userAuthentication, complaintController.getPendingComplaints);
/**
 * @swagger
 * /complaint/api/complaints/{id}/satisfaction:
 *   put:
 *     summary: Handle satisfaction
 *     tags: [Complaints]
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
 *         description: Satisfaction handled
 */
router.put('/api/complaints/:id/satisfaction',userAuthentication, complaintController.handleSatisfaction);

module.exports = router;
