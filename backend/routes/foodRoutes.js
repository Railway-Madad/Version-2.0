const {Router} = require('express');
const foodRouter = Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const foodcontroller = require("../controllers/foodcontroller");

/**
 * @swagger
 * /food:
 *   get:
 *     summary: Get all foods
 *     tags: [Food]
 *     responses:
 *       200:
 *         description: List of foods
 */
foodRouter.get("/", foodcontroller.getAllFoods);
/**
 * @swagger
 * /food:
 *   post:
 *     summary: Add new food
 *     tags: [Food]
 *     responses:
 *       201:
 *         description: Food added
 */
foodRouter.post("/", upload.single("image"), foodcontroller.addFood);

/**
 * @swagger
 * /food/{id}:
 *   get:
 *     summary: Get food by ID
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food details
 */
foodRouter.get("/:id", foodcontroller.getFoodById);

/**
 * @swagger
 * /food/{id}:
 *   put:
 *     summary: Update food
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food updated
 */
foodRouter.put("/:id", foodcontroller.updateFood);

/**
 * @swagger
 * /food/{id}:
 *   delete:
 *     summary: Delete food
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food deleted
 */
foodRouter.delete("/:id",foodcontroller.deleteFood);

module.exports = foodRouter;
