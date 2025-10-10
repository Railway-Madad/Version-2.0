const {cloudinary} = require("../config/cloudinary");
const streamifier = require("streamifier");
const LostFound = require("../models/lostnfoundModel");
const User = require("../models/userModel");
const { mongo } = require("mongoose");

const addItem = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { title, description, category, location } = req.body;

        if (!title || !description || !category || !location) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        let imageUrl = "";
        if (req.file) {
            const streamUpload = (fileBuffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "railmadad/lostnfound", resource_type: "image" },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(fileBuffer).pipe(stream);
                });
            };

            const uploadResult = await streamUpload(req.file.buffer);
            imageUrl = uploadResult.secure_url;
        }

        const newItem = await LostFound.create({
            userId,
            title,
            description,
            category,
            location,
            contactInfo: user.email,
            imageUrl,
        });

        res.status(201).json({ success: true, data: newItem });
    } catch (err) {
        console.error("Error in addItem:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getAllItems = async (req, res) => {
  try {
    const items = await LostFound.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};  

const getItemById = async (req, res) => {
  try {
    const lostfoundid = req.params.id;
    if (!mongo.ObjectId.isValid(lostfoundid)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const item = await LostFound.findById(lostfoundid);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteItem = async (req, res) => {
    // Only the user who created the item can delete it
    const userId = req.userId;
    try {
        const item = await LostFound.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });
        if (item.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        await LostFound.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const markAsResolved = async (req, res) => {
    // Only the user who created the item can mark it as resolved
    const userId = req.userId;
    try {
        const item = await LostFound.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });
        if (item.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        item.status = "Resolved";
        await item.save();
        res.status(200).json({ success: true, data: item });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getUserItems = async (req, res) => {
    const userId = req.userId;
    try {
        const items = await LostFound.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: items.length, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { addItem, getAllItems, getItemById, deleteItem, markAsResolved, getUserItems };
