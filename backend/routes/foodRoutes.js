const {Router} = require("express");
const Food = require("../models/foodModel");
const adminAuthentication = require('../middlewares/adminAuthentication');


const foodcontroller = require("../controllers/foodcontroller");

const foodRouter = Router();

foodRouter.get("/", foodcontroller.getAllFoods);

foodRouter.get("/:id", foodcontroller.getFoodById);

foodRouter.post("/",foodcontroller.addFood);
foodRouter.delete("/:id",foodcontroller.deleteFood);

module.exports = foodRouter;
