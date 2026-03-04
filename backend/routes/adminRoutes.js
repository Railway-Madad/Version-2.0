const {Router} = require('express');
const adminController = require('../controllers/admincontroller');
const adminAuthentication = require('../middlewares/adminAuthentication');

const adminRouter = Router();

// Auth
adminRouter.post('/register', adminController.register);
adminRouter.post('/login', adminController.login);
adminRouter.post('/logout', adminController.logout);

// Dashboard stats
adminRouter.get('/dashboard-stats', adminAuthentication, adminController.getDashboardStats);
adminRouter.get('/train-statistics', adminAuthentication, adminController.getTrainStatistics);

// Staff management
adminRouter.get('/train-staff', adminAuthentication, adminController.getTrainStaff);
adminRouter.put('/staff/:id', adminAuthentication, adminController.updateStaff);
adminRouter.delete('/staff/:id', adminAuthentication, adminController.deleteStaff);

// Complaints for the train
adminRouter.get('/train-complaints', adminAuthentication, adminController.getTrainComplaints);

// Catering orders for the train
adminRouter.get('/train-orders', adminAuthentication, adminController.getTrainOrders);

// Commands / notices to staff
adminRouter.post('/commands', adminAuthentication, adminController.sendCommand);
adminRouter.get('/commands', adminAuthentication, adminController.getTrainCommands);
adminRouter.delete('/commands/:id', adminAuthentication, adminController.deleteCommand);

// Train management
adminRouter.post('/trains', adminAuthentication, adminController.addTrain);

// Lost & Found for admin's train
adminRouter.get('/train-lostnfound', adminAuthentication, adminController.getTrainLostFound);

// Super admin — all data across all trains
adminRouter.get('/all-orders', adminAuthentication, adminController.getAllOrdersAll);
adminRouter.get('/all-complaints', adminAuthentication, adminController.getAllComplaintsAll);
adminRouter.get('/all-lostnfound', adminAuthentication, adminController.getAllLostFoundAll);
adminRouter.get('/all-staff', adminAuthentication, adminController.getAllStaffAll);

adminRouter.get('/test', adminAuthentication, (req, res) => {
    res.send("Admin route is working");
});

module.exports = adminRouter;