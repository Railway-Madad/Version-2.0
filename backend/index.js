require("dotenv").config();
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const staffRouter = require("./routes/staffRoutes");
const foodRouter = require("./routes/foodRoutes");
const complaintRouter = require("./routes/complaintRoutes");
const cateringRouter = require("./routes/cateringRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const newsRouter = require("./routes/newsRouter");
const feedbackRouter = require("./routes/feedbackRouter");
const lostnfoundRouter = require("./routes/lostnfoundRoutes");
const superadminRouter = require("./routes/superadminRoutes");
const Train = require("./models/trainModel");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
// Logger middleware
const {
  requestLogger,
  consoleLogger,
  errorLogger,
  errorCapture,
  errorHandler,
} = require("./config/logger");

const app = express();

// CORS configuration for cookies support
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175", 
      "http://localhost:5176",
      process.env.FRONTEND_URL // Vercel production URL
    ], // Frontend URLs
    credentials: true, // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })  
);

// Cookie parser middleware - Parse cookies from requests
app.use(cookieParser());

// Request logging middleware
app.use(requestLogger); // Logs all requests to access.log
app.use(consoleLogger); // Logs requests to console (development)
app.use(errorLogger); // Logs errors to error.log

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/user", userRouter);
app.use("/uploads", express.static("uploads"));
app.use('/admin',adminRouter);
app.use('/staff',staffRouter);
app.use("/food", foodRouter);
app.use("/complaint", complaintRouter);
app.use('/catering',cateringRouter);
app.use('/emergency', emergencyRoutes);
app.use("/news", newsRouter);
app.use("/feedback", feedbackRouter);
app.use("/lostnfound", lostnfoundRouter);
app.use('/superadmin', superadminRouter);

// Swagger API documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//For the cookie testing putpose i have added 
app.get("/test-cookie", (req, res) => {
    res.cookie("testCookie", "working", { httpOnly: true });
    res.json({ 
        message: "Cookie set!", 
        cookies: req.cookies 
    });
});

// Get available trains
/**
 * @swagger
 * /api/trains:
 *   get:
 *     summary: Get available trains
 *     tags: [Trains]
 *     responses:
 *       200:
 *         description: A list of trains
 */
app.get("/api/trains", async (req, res) => {
  try {
    const trains = await Train.find({});
    res.status(200).json({
      success: true,
      data: trains.map(train => ({
        id: train._id,
        trainNumber: train.trainNumber
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/**
 * @swagger
 * /api/trains:
 *   post:
 *     summary: Add a new train
 *     tags: [Trains]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Train created successfully
 */
app.post("/api/trains", async (req, res) => {
  try {
    const { trainNumber } = req.body;
    const newTrain = new Train({ trainNumber });
    await newTrain.save();
    res.status(201).json({ success: true, data: newTrain });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


app.get("/", (req, res) => {
  res.send("Server is working");
});

// Error handling middleware (must be after all routes)
app.use(errorCapture);
app.use(errorHandler);

// ── Seed default super-admin credentials on startup ──
const Admin = require("./models/adminModel");
const bcryptSeed = require("bcryptjs");

async function seedAdmin() {
  try {
    const USERNAME = "superadmin";
    const PASSWORD = "password123";
    const existing = await Admin.findOne({ username: USERNAME });
    const hashed = await bcryptSeed.hash(PASSWORD, 10);
    if (existing) {
      // Update password in case it was changed manually
      existing.password = hashed;
      existing.trainNo = existing.trainNo || "ALL";
      await existing.save();
      console.log(`[seed] Admin "${USERNAME}" credentials refreshed.`);
    } else {
      await Admin.create({
        username: USERNAME,
        email: "superadmin@railway.com",
        password: hashed,
        trainNo: "ALL",
      });
      console.log(`[seed] Admin "${USERNAME}" created (password: ${PASSWORD}).`);
    }
  } catch (err) {
    console.error("[seed] Could not seed admin:", err.message);
  }
}

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    await seedAdmin(); // ensure default credentials exist
    return app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

if (require.main === module && process.env.NODE_ENV !== "test") {
  connect();
}

module.exports = {
  app,
  connect,
  seedAdmin,
};
