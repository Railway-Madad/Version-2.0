const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/', complaintController.getAllComplaints);
router.post('/submit-complaint', upload.single('image'), complaintController.postComplaint);
router.get('/api/complaints/user/:username', complaintController.getComplaintsByUser);
router.put('/api/complaints/:id/resolve', complaintController.resolveComplaint);
router.delete('/api/complaints/:id', complaintController.deleteComplaint);
router.get('/complaints/all', complaintController.getAllComplaints);
router.get('/api/images/user/:username', complaintController.getImagesByUser);

module.exports = router;
