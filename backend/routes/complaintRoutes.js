const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadDir, { recursive: true }).catch(err => {
    console.error('Error creating uploads directory:', err);
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.get('/', complaintController.getComplaintForm);
router.post('/submit-complaint', upload.single('image'), complaintController.postComplaint);
router.get('/api/complaints/:id', complaintController.getComplaintById);
router.get('/api/complaints/user/:username', complaintController.getComplaintsByUser);
router.put('/api/complaints/:id/resolve', complaintController.resolveComplaint);
router.delete('/api/complaints/:id', complaintController.deleteComplaint);
router.get('/upload-image', complaintController.getUploadForm);
router.get('/complaints', complaintController.getPaginatedComplaints);
router.get('/complaints/all', complaintController.getAllComplaints);
router.post('/upload-image', upload.single('image'), complaintController.postImage);
router.get('/api/images/user/:username', complaintController.getImagesByUser);

module.exports = router;