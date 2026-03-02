const { Router } = require("express");
const cateringController = require("../controllers/cateringcontroller");

const userAuthentication = require("../middlewares/userAuthentication");
const staffAuthentication = require("../middlewares/staffAuthentication");

const cateringRouter = Router();

cateringRouter.post("/order",userAuthentication, cateringController.placeOrder);
cateringRouter.get("/my-orders",userAuthentication, cateringController.getMyCateringOrders);
cateringRouter.get("/my-orders-history",userAuthentication, cateringController.getMyAllCateringOrders);

cateringRouter.get("/all-orders", staffAuthentication, cateringController.getAllCateringOrders);
cateringRouter.put("/:id/status", staffAuthentication, cateringController.updateOrderStatus);

module.exports = cateringRouter