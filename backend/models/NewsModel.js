const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for the news"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description for the news"],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "https://res.cloudinary.com/dmbvazgkw/image/upload/v1760010018/news_updates/ixmeqadqrinanw7t9dql.jpg",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("News", newsSchema);
