const Feedback = require("../models/feedbackModel");

const addFeedback = async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;

    if (!name || !email || !rating || !comment) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const feedback = await Feedback.create({ name, email, rating, comment });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const avgRatingData = await Feedback.aggregate([
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    const avgRating = avgRatingData.length ? avgRatingData[0].averageRating.toFixed(2) : 0;

    res.status(200).json({
      success: true,
      stats: { totalFeedbacks: total, averageRating: avgRating },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { addFeedback, getAllFeedbacks, getFeedbackStats };
