const express = require('express');
const router = express.Router();
const { createEmergency, getallEmergencies } = require('../controllers/emergencyController');
const userAuthentication = require("../middlewares/userAuthentication");

router.post('/postEmg',userAuthentication, createEmergency);
router.get('/getEmg', getallEmergencies);

module.exports = router;