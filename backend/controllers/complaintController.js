const { cloudinary } = require("../config/cloudinary");
const Complaint = require("../models/complaintModel");
const streamifier = require("streamifier");

//post
exports.postComplaint = async (req, res) => {
  try {
    const { username, pnr,bogieNumber,seatNumber,description, issueDomain } = req.body;
    const file = req.file;

    if (!username || !pnr || !description || !issueDomain) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let linkurl = null;

    if (file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "railmadad/complaints" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(file.buffer);
      linkurl = result.secure_url;
    }

    const complaint = new Complaint({
      userId: req.userId,
      username,
      pnr,
      bogieNumber,
      seatNumber,
      description,
      issueDomain,
      linkurl,
      status: "Pending",
    });

    await complaint.save();
    res.json({ success: true, message: "Complaint submitted successfully", complaint });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET: Get complaints by username
exports.getComplaintsByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      username: req.params.username,
    }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ error: "Server error" });
  }
};
//Get by status
exports.getComplaintByStatus = async (req, res) => {
 //by default get Important complaints
  const status = "Important";
  try {
    const complaints = await Complaint.find({ status }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints by status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE: delete complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    await complaint.deleteOne();
    res.json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ error: "Server error" });
  }
};



// PUT: Mark complaint as resolved
exports.resolveComplaint = async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "Resolved",
        resolvedAt: new Date(),
        resolutionDetails: req.body.resolutionDetails || ""
      },
      { new: true }
    );

    if (!updatedComplaint)
      return res.status(404).json({ error: "Complaint not found" });

    res.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    console.error("Error resolving complaint:", error);
    res.status(500).json({ error: "Server error" });
  }
};
// GET:
exports.getComplaintsByDomain = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      issueDomain: req.params.domain,
    }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints by domain:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET: All user images
exports.getImagesByUser = async (req, res) => {
  try {
    const images = await Complaint.find({
      username: req.params.username,
      linkurl: { $ne: null },
    }).sort({ createdAt: -1 });

    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET: All complaints (for admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    res.status(500).json({ error: "Server error" });
  }
};
