const { Router } = require("express");
const cateringController = require("../controllers/cateringcontroller");

const userAuthentication = require("../middlewares/userAuthentication");

const cateringRouter = Router();

cateringRouter.post("/order",userAuthentication, cateringController.placeOrder);
cateringRouter.get("/my-orders",userAuthentication, cateringController.getMyCateringOrders);

cateringRouter.get("/all-orders", cateringController.getAllCateringOrders);
cateringRouter.put("/:id/status", cateringController.updateOrderStatus);

module.exports = cateringRouter;