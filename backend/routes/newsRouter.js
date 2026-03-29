const express = require("express");
const multer = require("multer");
const { addNews, getAllNews, deleteNews } = require("../controllers/newsController");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Add news
 *     tags: [News]
 *     responses:
 *       201:
 *         description: News added
 */
router.post("/", upload.single("image"), addNews);

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Get all news
 *     tags: [News]
 *     responses:
 *       200:
 *         description: List of news
 */
router.get("/", getAllNews);

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Delete news
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News deleted
 */
router.delete("/:id", deleteNews);

module.exports = router;
