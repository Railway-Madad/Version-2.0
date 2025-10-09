const express = require('express');
const router = express.Router();
const { createEmergency } = require('../controllers/emergencyController');
const userAuthentication = require("../middlewares/userAuthentication");

router.post('/postEmg',userAuthentication, createEmergency);

module.exports = router;
