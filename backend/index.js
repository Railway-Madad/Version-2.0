require("dotenv").config();
const cors = require("cors");
const express = require("express");
const multer = require("multer");

const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const staffRouter = require("./routes/staffRoutes");
const foodRouter = require("./routes/foodRoutes");
const complaintRouter = require("./routes/complaintRoutes");
const cateringRouter = require("./routes/cateringRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();
app.use(cors());
//purval and bapya 5500 var chalva he
// app.use(
//   cors({
//     origin: "http://localhost:5500",

//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/user", userRouter);
app.use("/uploads", express.static("uploads"));
// app.use('/admin',adminRouter);
app.use('/staff',staffRouter);
app.use("/food", foodRouter);
app.use("/complaint", complaintRouter);
app.use('/catering',cateringRouter);
app.use('/emergency', emergencyRoutes);
app.get("/", (req, res) => {
  res.send("Server is working");
});

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connect();
