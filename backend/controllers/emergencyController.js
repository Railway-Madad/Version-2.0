const Emergency = require('../models/emergencyModel');

exports.createEmergency = async (req, res) => {
  try {
    const { username, trainNumber, seatNumber } = req.body;

    if (!username || !trainNumber || !seatNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newEmergency = new Emergency({
      userId: req.userId,
      username,
      trainNumber,
      seatNumber
      
    });

    await newEmergency.save();
    res.status(201).json({ message: "Emergency request created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
