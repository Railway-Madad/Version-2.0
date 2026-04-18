const mongoose = require("mongoose");
const emergencySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  trainNumber: { type: String, required: true },
  seatNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Active", "InProcess", "Resolved"],
    default: "Active" 
  },
  createdAt: { type: Date, default: Date.now },
});

emergencySchema.index({ trainNumber: 1, createdAt: -1 });
emergencySchema.index({ trainNumber: 1, status: 1, createdAt: -1 });
emergencySchema.index({ status: 1, createdAt: -1 });
emergencySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Emergency", emergencySchema);
