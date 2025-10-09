const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const multer = require('multer');
const userAuthentication = require("../middlewares/userAuthentication");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/',userAuthentication, complaintController.getAllComplaints);
router.post('/submit-complaint',userAuthentication, upload.single('image'), complaintController.postComplaint);
router.get('/api/complaints/user/:username',userAuthentication, complaintController.getComplaintsByUser);
router.put('/api/complaints/:id/resolve',userAuthentication, complaintController.resolveComplaint);
router.get('/api/complaints/:domain',userAuthentication, complaintController.getComplaintsByDomain);
router.delete('/api/complaints/:id',userAuthentication, complaintController.deleteComplaint);
router.get('/complaints/all',userAuthentication, complaintController.getAllComplaints);
router.get('/api/images/user/:username',userAuthentication, complaintController.getImagesByUser);
//reslove complaint

module.exports = router;
