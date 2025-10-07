const {Router} = require("express");
const Food = require("../models/foodModel");
const adminAuthentication = require('../middlewares/adminAuthentication');


const foodcontroller = require("../controllers/foodcontroller");

const foodRouter = Router();

foodRouter.get("/", foodcontroller.getAllFoods);

foodRouter.get("/:id", foodcontroller.getFoodById);

foodRouter.post("/",adminAuthentication,foodcontroller.addFood);
foodRouter.delete("/:id",adminAuthentication,foodcontroller.deleteFood);

module.exports = foodRouter;
