const Emergency = require('../models/emergencyModel');

exports.createEmergency = async (req, res) => {
  try {
    const { username, seatNumber } = req.body;

    if (!username || !seatNumber) {
      return res.status(400).json({ error: "All fields are required (username, seatNumber)" });
    }

    const newEmergency = new Emergency({
      userId: req.userId,
      username,
      trainNumber: req.trainNo, // Use trainNo from middleware
      seatNumber
    });
    
    await newEmergency.save();
    res.status(201).json({ message: "Emergency request created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getallEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ trainNumber: req.trainNo });
    res.status(200).json(emergencies);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};