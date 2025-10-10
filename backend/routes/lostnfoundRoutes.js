const {Router} = require("express");
const lostnfoundRouter = Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const lostnfoundController = require("../controllers/lostnfoundController");
const userAuthentication = require("../middlewares/userAuthentication");

lostnfoundRouter.get("/test", userAuthentication, (req, res) => {
  res.send("Lost and Found route is working");
});

lostnfoundRouter.get("/", userAuthentication, lostnfoundController.getAllItems);

lostnfoundRouter.post("/", userAuthentication, upload.single("image"), lostnfoundController.addItem);

//get all items of the logged in user
lostnfoundRouter.get("/myitems", userAuthentication, lostnfoundController.getUserItems);

lostnfoundRouter.get("/:id", userAuthentication, lostnfoundController.getItemById);

lostnfoundRouter.delete("/:id", userAuthentication, lostnfoundController.deleteItem);
lostnfoundRouter.put("/:id/resolve", userAuthentication, lostnfoundController.markAsResolved);


module.exports = lostnfoundRouter;
// export default lostnfoundRouter; --- IGNORE ---