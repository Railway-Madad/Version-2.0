const Catering = require("../models/cateringModel");
const Food = require("../models/foodModel"); 

const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Please provide items and a delivery address.",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.foodItem);
      if (!food) {
        return res
          .status(404)
          .json({ success: false, message: `Food item with ID ${item.foodItem} not found.` });
      }
      if (item.quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: `Quantity for ${food.name} must be at least 1.` });
      }
      orderItems.push({
        foodItem: food._id,
        quantity: item.quantity,
        priceAtOrder: food.price, 
      });
      totalPrice += food.price * item.quantity;
    }

    const newOrder = await Catering.create({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      notes,
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getAllCateringOrders = async (req, res) => {
  try {
    const orders = await Catering.find({})
      .populate("user", "name email") 
      .populate("items.foodItem", "name price"); 
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getMyCateringOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }

    const orders = await Catering.find({ user: req.user._id })
      .populate("items.foodItem", "name price");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["pending", "preparing", "out for delivery", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided." });
    }

    const order = await Catering.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("items.foodItem", "name price");

    if (!order) {
      return res.status(404).json({ success: false, message: "Catering order not found." });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  placeOrder,
  getAllCateringOrders,
  getMyCateringOrders,
  updateOrderStatus,
};
