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
    const query = req.trainNo ? { trainNumber: req.trainNo } : {};
    const emergencies = await Emergency.find(query).sort({ createdAt: -1 });
    res.status(200).json(emergencies);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Admin: Get emergencies for admin's train
exports.getAdminEmergencies = async (req, res) => {
  try {
    const query = req.trainNo ? { trainNumber: req.trainNo } : {};
    const emergencies = await Emergency.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: emergencies });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Admin: Mark emergency as InProcess
exports.markEmergencyInProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const emergency = await Emergency.findById(id);
    
    if (!emergency) {
      return res.status(404).json({ success: false, message: "Emergency not found" });
    }
    
    if (emergency.status !== "Active") {
      return res.status(400).json({ success: false, message: "Only active emergencies can be marked as in process" });
    }
    
    emergency.status = "InProcess";
    await emergency.save();
    
    res.status(200).json({ success: true, message: "Emergency marked as in process", data: emergency });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// User: Resolve emergency (only when InProcess)
exports.resolveEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const emergency = await Emergency.findById(id);
    
    if (!emergency) {
      return res.status(404).json({ success: false, message: "Emergency not found" });
    }
    
    // Verify the user owns this emergency
    if (emergency.userId !== userId) {
      return res.status(403).json({ success: false, message: "You can only resolve your own emergencies" });
    }
    
    if (emergency.status !== "InProcess") {
      return res.status(400).json({ success: false, message: "Only emergencies that are in process can be resolved" });
    }
    
    emergency.status = "Resolved";
    await emergency.save();
    
    res.status(200).json({ success: true, message: "Emergency resolved successfully", data: emergency });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// User: Get only their own emergencies for their train
exports.getUserEmergencies = async (req, res) => {
  try {
    const userId = req.userId;
    const trainNumber = req.trainNo;
    
    const query = { userId };
    if (trainNumber) {
      query.trainNumber = trainNumber;
    }
    
    const emergencies = await Emergency.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: emergencies });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};