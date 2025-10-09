const mongoose = require("mongoose");
const emergencySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  trainNumber: { type: String, required: true },
  seatNumber: { type: String, required: true },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Emergency", emergencySchema);
