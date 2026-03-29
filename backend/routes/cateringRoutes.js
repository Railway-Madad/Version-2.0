const { Router } = require("express");
const cateringController = require("../controllers/cateringcontroller");

const userAuthentication = require("../middlewares/userAuthentication");
const staffAuthentication = require("../middlewares/staffAuthentication");

const cateringRouter = Router();

/**
 * @swagger
 * /catering/order:
 *   post:
 *     summary: Place a catering order
 *     tags: [Catering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed
 */
cateringRouter.post("/order",userAuthentication, cateringController.placeOrder);
/**
 * @swagger
 * /catering/my-orders:
 *   get:
 *     summary: Get my catering orders
 *     tags: [Catering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of own orders
 */
cateringRouter.get("/my-orders",userAuthentication, cateringController.getMyCateringOrders);
/**
 * @swagger
 * /catering/my-orders-history:
 *   get:
 *     summary: Get my catering orders history
 *     tags: [Catering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order history
 */
cateringRouter.get("/my-orders-history",userAuthentication, cateringController.getMyAllCateringOrders);

/**
 * @swagger
 * /catering/all-orders:
 *   get:
 *     summary: Get all catering orders
 *     tags: [Catering]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
cateringRouter.get("/all-orders", staffAuthentication, cateringController.getAllCateringOrders);
/**
 * @swagger
 * /catering/{id}/status:
 *   put:
 *     summary: Update catering order status
 *     tags: [Catering]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
cateringRouter.put("/:id/status", staffAuthentication, cateringController.updateOrderStatus);

module.exports = cateringRouter