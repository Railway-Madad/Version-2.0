const express = require("express");
const { addFeedback, getAllFeedbacks, getFeedbackStats } = require("../controllers/feedbackController");

const router = express.Router();

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Add feedback
 *     tags: [Feedback]
 *     responses:
 *       201:
 *         description: Feedback added
 */
router.post("/", addFeedback);

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Get all feedbacks
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: List of feedbacks
 */
router.get("/", getAllFeedbacks);

/**
 * @swagger
 * /feedback/stats:
 *   get:
 *     summary: Get feedback statistics
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Feedback stats
 */
router.get("/stats", getFeedbackStats);

module.exports = router;
