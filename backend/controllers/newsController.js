const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const News = require("../models/NewsModel");

const addNews = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Please provide title and description" });
    }

    let imageUrl = "https://res.cloudinary.com/dmbvazgkw/image/upload/v1760010018/news_updates/ixmeqadqrinanw7t9dql.jpg";

    if (file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "news_updates", resource_type: "image" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(file.buffer);
      imageUrl = result.secure_url;
    }

    const news = await News.create({ title, description, imageUrl });
    res.status(201).json({ success: true, data: news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAllNews = async (req, res) => {
  try {
    const newsList = await News.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: newsList.length, data: newsList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: "News not found" });
    res.status(200).json({ success: true, message: "News deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { addNews, getAllNews, deleteNews };
