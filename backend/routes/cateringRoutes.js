const { Router } = require("express");
const cateringController = require("../controllers/cateringcontroller");


const cateringRouter = Router();


cateringRouter.post("/order", cateringController.placeOrder);
cateringRouter.get("/my-orders", cateringController.getMyCateringOrders);


cateringRouter.get("/all-orders", cateringController.getAllCateringOrders);
cateringRouter.put("/:id/status", cateringController.updateOrderStatus);

module.exports = cateringRouter;
