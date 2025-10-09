const {Router} = require('express');
const foodRouter = Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const foodcontroller = require("../controllers/foodcontroller");

foodRouter.get("/", foodcontroller.getAllFoods);

foodRouter.get("/:id", foodcontroller.getFoodById);

foodRouter.post("/", upload.single("image"), foodcontroller.addFood);
foodRouter.delete("/:id",foodcontroller.deleteFood);

module.exports = foodRouter;
