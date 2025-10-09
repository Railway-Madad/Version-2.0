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
