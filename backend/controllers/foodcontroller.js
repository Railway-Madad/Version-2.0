const Food = require("../models/foodModel");
const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const { paginateModel } = require("../utils/pagination");
const {
  getJsonCache,
  setJsonCache,
  deleteCacheKey,
  deleteCachePattern,
} = require("../config/redis");

const FOOD_LIST_CACHE_PREFIX = "food:list:";
const FOOD_BY_ID_CACHE_PREFIX = "food:id:";

const buildListCacheKey = (query) => {
  const queryPayload = JSON.stringify(query || {});
  return `${FOOD_LIST_CACHE_PREFIX}${encodeURIComponent(queryPayload)}`;
};

const buildFoodByIdKey = (id) => `${FOOD_BY_ID_CACHE_PREFIX}${id}`;

const invalidateFoodCache = async (foodId) => {
  await deleteCachePattern(`${FOOD_LIST_CACHE_PREFIX}*`);
  if (foodId) {
    await deleteCacheKey(buildFoodByIdKey(foodId));
  }
};

const getAllFoods = async (req, res) => {
  try {
    const cacheKey = buildListCacheKey(req.query);
    const cached = await getJsonCache(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    const result = await paginateModel({
      model: Food,
      query: req.query,
      sort: { createdAt: -1 },
    });

    const response = {
      success: true,
      data: result.data,
      nextCursor: result.nextCursor || null,
      hasMore: Boolean(result.hasMore),
    };

    await setJsonCache(cacheKey, response, 60);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const getFoodById = async (req, res) => {
  try {
    const cacheKey = buildFoodByIdKey(req.params.id);
    const cached = await getJsonCache(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }

    const response = { success: true, data: food };
    await setJsonCache(cacheKey, response, 60);

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addFood = async (req, res) => {
  try {
    const { name, price, description, category, isAvailable } = req.body;
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
            { folder: "railmadad/food_items" },
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
      category: category || "Snacks",
      imageUrl: linkurl,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    await invalidateFoodCache(newFood._id?.toString());

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

    await invalidateFoodCache(req.params.id);

    res.status(200).json({ success: true, message: "Food item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateFood = async (req, res) => {
  try {
    const { isAvailable, name, price, description, category } = req.body;
    
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food item not found" });
    }

    // Update fields if provided
    if (isAvailable !== undefined) food.isAvailable = isAvailable;
    if (name) food.name = name;
    if (price) food.price = price;
    if (description !== undefined) food.description = description;
    if (category) food.category = category;

    await food.save();

    await invalidateFoodCache(food._id?.toString());

    res.status(200).json({ success: true, data: food });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  addFood,
  deleteFood,
  updateFood
};
