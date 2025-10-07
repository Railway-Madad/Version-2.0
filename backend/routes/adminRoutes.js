const {Router} = require('express');
const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminController = require('../controllers/admincontroller');
const adminAuthentication = require('../middlewares/adminAuthentication');

const adminRouter = Router();

adminRouter.post('/register', adminController.register);
adminRouter.post('/login', adminController.login);
adminRouter.get('/test', adminAuthentication, (req, res) => {
    res.send("Admin route is working");
});

module.exports = adminRouter;