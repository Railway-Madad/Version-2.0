const { cloudinary } = require("../config/cloudinary");
const Complaint = require("../models/complaintModel");
const streamifier = require("streamifier");
const { paginateModel } = require("../utils/pagination");

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
      trainNumber: req.trainNo, // Use trainNo from authentication middleware
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
    const result = await paginateModel({
      model: Complaint,
      query: req.query,
      filter: { username: req.params.username },
      sort: { createdAt: -1 },
    });

    res.set("X-Has-More", String(result.hasMore));
    if (result.nextPage) res.set("X-Next-Page", String(result.nextPage));
    if (result.nextCursor) res.set("X-Next-Cursor", String(result.nextCursor));
    res.json(result.data);
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
    const result = await paginateModel({
      model: Complaint,
      query: req.query,
      filter: { status },
      sort: { createdAt: -1 },
    });

    res.set("X-Has-More", String(result.hasMore));
    if (result.nextPage) res.set("X-Next-Page", String(result.nextPage));
    if (result.nextCursor) res.set("X-Next-Cursor", String(result.nextCursor));
    res.json(result.data);
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



// PUT:  complaint as resolved
//future imporovement required here 
exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    complaint.status = "Resolved";
    complaint.resolutionDetails = "resolved by admin"; 
    
    await complaint.save();
    res.json({ success: true, message: "Complaint marked as resolved", complaint });
  } catch (error) {
    console.error("Error resolving complaint:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET:
exports.getComplaintsByDomain = async (req, res) => {
  try {
    const result = await paginateModel({
      model: Complaint,
      query: req.query,
      filter: { issueDomain: req.params.domain },
      sort: { createdAt: -1 },
    });

    res.set("X-Has-More", String(result.hasMore));
    if (result.nextPage) res.set("X-Next-Page", String(result.nextPage));
    if (result.nextCursor) res.set("X-Next-Cursor", String(result.nextCursor));
    res.json(result.data);
  } catch (error) {
    console.error("Error fetching complaints by domain:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET: All user images
exports.getImagesByUser = async (req, res) => {
  try {
    const result = await paginateModel({
      model: Complaint,
      query: req.query,
      filter: {
        username: req.params.username,
        linkurl: { $ne: null },
      },
      sort: { createdAt: -1 },
    });

    res.set("X-Has-More", String(result.hasMore));
    if (result.nextPage) res.set("X-Next-Page", String(result.nextPage));
    if (result.nextCursor) res.set("X-Next-Cursor", String(result.nextCursor));
    res.json(result.data);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET: All complaints (for admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const result = await paginateModel({
      model: Complaint,
      query: req.query,
      filter: { trainNumber: req.trainNo },
      sort: { createdAt: -1 },
    });

    res.set("X-Has-More", String(result.hasMore));
    if (result.nextPage) res.set("X-Next-Page", String(result.nextPage));
    if (result.nextCursor) res.set("X-Next-Cursor", String(result.nextCursor));
    res.json(result.data);
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    res.status(500).json({ error: "Server error" });
  }
};
//Get all complaints but not resolved
exports.getPendingComplaints = async (req, res) => {
  try {
    const result = await paginateModel({
      model: Complaint,
      query: req.query,
      filter: { status: { $ne: 'Resolved' }, trainNumber: req.trainNo },
      sort: { createdAt: -1 },
    });

    res.set("X-Has-More", String(result.hasMore));
    if (result.nextPage) res.set("X-Next-Page", String(result.nextPage));
    if (result.nextCursor) res.set("X-Next-Cursor", String(result.nextCursor));
    res.json(result.data);
  } catch (error) {
    console.error("Error fetching pending complaints:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT: Handle user satisfaction feedback
exports.handleSatisfaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { satisfied } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    if (complaint.status !== 'AwaitingConfirmation') {
      return res.status(400).json({ error: "Complaint is not awaiting confirmation" });
    }

    if (satisfied) {
      // User is satisfied - mark as resolved
      complaint.status = 'Resolved';
    } else {
      // User is not satisfied - rollback to pending
      complaint.status = 'Pending';
      complaint.resolvedAt = null;
      complaint.resolutionDetails = '';
      complaint.resolvedBy = null;
    }

    await complaint.save();
    res.json({ success: true, message: satisfied ? "Complaint confirmed as resolved" : "Complaint rolled back to pending", complaint });
  } catch (error) {
    console.error("Error handling satisfaction:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET: Get all user's complaints across all trains (for historical view)
exports.getMyAllComplaints = async (req, res) => {
  try {
    const result = await paginateModel({
      model: Complaint,
      query: req.query,
      filter: { userId: req.userId },
      sort: { createdAt: -1 },
    });

    res.json({
      success: true,
      data: result.data,
      nextCursor: result.nextCursor || null,
      hasMore: Boolean(result.hasMore),
    });
  } catch (error) {
    console.error("Error fetching all user complaints:", error);
    res.status(500).json({ error: "Server error" });
  }
};
