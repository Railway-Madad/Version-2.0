const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for the food item."],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price for the food item."],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Food", foodSchema);
