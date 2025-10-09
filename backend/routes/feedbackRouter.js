const express = require("express");
const { addFeedback, getAllFeedbacks, getFeedbackStats } = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", addFeedback);

router.get("/", getAllFeedbacks);

router.get("/stats", getFeedbackStats);

module.exports = router;
