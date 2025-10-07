const {Router} = require('express');
const Admin = require('../models/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const staffController = require('../controllers/admincontroller');
const adminAuthentication = require('../middlewares/adminAuthentication');

const staffRouter = Router();

staffRouter.post('/register',adminAuthentication, staffController.register);
staffRouter.post('/login', staffController.login);
staffRouter.get('/test', (req, res) => {
    res.send("Staff route is working");
});

module.exports = staffRouter;