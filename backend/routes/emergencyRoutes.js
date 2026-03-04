const express = require('express');
const router = express.Router();
const { createEmergency, getallEmergencies, getAdminEmergencies, markEmergencyInProcess, resolveEmergency, getUserEmergencies } = require('../controllers/emergencyController');
const userAuthentication = require("../middlewares/userAuthentication");
const adminAuthentication = require("../middlewares/adminAuthentication");

router.post('/postEmg', userAuthentication, createEmergency);
router.get('/getEmg', getallEmergencies);
router.get('/my-emergencies', userAuthentication, getUserEmergencies);
router.get('/admin/getEmg', adminAuthentication, getAdminEmergencies);
router.put('/:id/inprocess', adminAuthentication, markEmergencyInProcess);
router.put('/:id/resolve', userAuthentication, resolveEmergency);

module.exports = router;