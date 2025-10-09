const {Router} = require('express');
const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const staffController = require('../controllers/staffcontroller');
const adminAuthentication = require('../middlewares/adminAuthentication');
const staffAuthentication = require('../middlewares/staffAuthentication');

const staffRouter = Router();

staffRouter.post('/register', staffController.register);
staffRouter.post('/login', staffController.login);
//get complaints of respective staff
staffRouter.get('/complaints', staffAuthentication, staffController.getComplaints);
//resolve complaint
staffRouter.put('/complaints/:id/resolve', staffAuthentication, staffController.resolveComplaint);
staffRouter.get('/profile', staffAuthentication, staffController.getProfile);
//get staff name by id
staffRouter.get('/getname/:id', staffAuthentication, staffController.getStaffById);
staffRouter.get('/test', (req, res) => {
    res.send("Staff route is working in backend");
});

module.exports = staffRouter;