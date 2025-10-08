const { cloudinary } = require("../config/cloudinary");
const Complaint = require("../models/complaintModel");
const fs = require("fs").promises;


// POST 
exports.postComplaint = async (req, res) => {
  try {
    const { username, pnr, description, issueDomain } = req.body;
    const file = req.file;

    if (!username || !pnr || !description || !issueDomain) {
      if (file) await fs.unlink(file.path).catch(() => {});
      return res.status(400).json({ error: "All fields are required" });
    }

    let linkurl = null;
    if (file) {
      try {
        await fs.access(file.path);
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "railmadad/complaints",
          public_id: `complaint_${Date.now()}`,
          resource_type: "image",
        });
        linkurl = uploadResult.secure_url;
        await fs.unlink(file.path).catch(() => {});
      } catch (err) {
        if (file) await fs.unlink(file.path).catch(() => {});
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const complaint = new Complaint({
      userId: req.userId || null,
      username,
      pnr,
      description,
      issueDomain,
      linkurl,
      status: "Pending",
    });

    await complaint.save();
    res.json({ success: true, message: "Complaint submitted successfully", complaint });
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET
exports.getComplaintsByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({ username: req.params.username }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    // Only allow owner to delete
    const currentUser = req.body.username || req.query.username;
    if (!currentUser || complaint.username !== currentUser)
      return res.status(403).json({ error: "Unauthorized" });

    await Complaint.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT 
exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "Resolved",
        resolvedAt: new Date(),
        resolutionDetails: req.body.resolutionDetails || "",
        resolutionCategory: req.body.resolutionCategory || "",
      },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    res.json({ success: true, complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET 
exports.getImagesByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      username: req.params.username,
      linkurl: { $ne: null },
    }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET 
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
