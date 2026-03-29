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

/**
 * @swagger
 * /lostnfound:
 *   get:
 *     summary: Get all lost and found items
 *     tags: [Lost & Found]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
lostnfoundRouter.get("/", userAuthentication, lostnfoundController.getAllItems);

/**
 * @swagger
 * /lostnfound:
 *   post:
 *     summary: Add a lost and found item
 *     tags: [Lost & Found]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Item added
 */
lostnfoundRouter.post("/", userAuthentication, upload.single("image"), lostnfoundController.addItem);

/**
 * @swagger
 * /lostnfound/myitems:
 *   get:
 *     summary: Get user's lost and found items
 *     tags: [Lost & Found]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user items
 */
lostnfoundRouter.get("/myitems", userAuthentication, lostnfoundController.getUserItems);

/**
 * @swagger
 * /lostnfound/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Lost & Found]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item details
 */
lostnfoundRouter.get("/:id", userAuthentication, lostnfoundController.getItemById);

/**
 * @swagger
 * /lostnfound/{id}:
 *   delete:
 *     summary: Delete item
 *     tags: [Lost & Found]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 */
lostnfoundRouter.delete("/:id", userAuthentication, lostnfoundController.deleteItem);
/**
 * @swagger
 * /lostnfound/{id}/resolve:
 *   put:
 *     summary: Mark item as resolved
 *     tags: [Lost & Found]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item resolved
 */
lostnfoundRouter.put("/:id/resolve", userAuthentication, lostnfoundController.markAsResolved);


module.exports = lostnfoundRouter;
// export default lostnfoundRouter; --- IGNORE ---