const express = require("express");
const multer = require("multer");
const { addNews, getAllNews, deleteNews } = require("../controllers/newsController");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), addNews);

router.get("/", getAllNews);

router.delete("/:id", deleteNews);

module.exports = router;
