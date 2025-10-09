const Food = require("../models/foodModel");
const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");

const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({});
    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }

    res.status(200).json({ success: true, data: food });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const Food = require("../models/foodModel");

const addFood = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const file = req.file;
    let linkurl = null;

    const defaultImageUrl = "https://res.cloudinary.com/dmbvazgkw/image/upload/v1759990412/food_items/a8kcqemnj2arretoj0pt.png";

    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide name and price" });
    }

    if (file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "food_items" },
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
    } else {
      linkurl = defaultImageUrl;
    }

    const newFood = await Food.create({
      name,
      price,
      description,
      category,
      imageUrl: linkurl,
    });

    res.status(201).json({ success: true, data: newFood });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }

    res.status(200).json({ success: true, message: "Food item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  addFood,
  deleteFood
};
