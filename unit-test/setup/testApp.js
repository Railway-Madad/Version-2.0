const express = require("express");
const cookieParser = require("cookie-parser");

const userRouter = require("../../backend/routes/userRoutes");
const adminRouter = require("../../backend/routes/adminRoutes");
const staffRouter = require("../../backend/routes/staffRoutes");
const foodRouter = require("../../backend/routes/foodRoutes");
const complaintRouter = require("../../backend/routes/complaintRoutes");
const cateringRouter = require("../../backend/routes/cateringRoutes");
const emergencyRoutes = require("../../backend/routes/emergencyRoutes");
const newsRouter = require("../../backend/routes/newsRouter");
const feedbackRouter = require("../../backend/routes/feedbackRouter");
const lostnfoundRouter = require("../../backend/routes/lostnfoundRoutes");
const superadminRouter = require("../../backend/routes/superadminRoutes");

const buildTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/user", userRouter);
  app.use("/admin", adminRouter);
  app.use("/staff", staffRouter);
  app.use("/food", foodRouter);
  app.use("/complaint", complaintRouter);
  app.use("/catering", cateringRouter);
  app.use("/emergency", emergencyRoutes);
  app.use("/news", newsRouter);
  app.use("/feedback", feedbackRouter);
  app.use("/lostnfound", lostnfoundRouter);
  app.use("/superadmin", superadminRouter);

  app.get("/api/trains", (req, res) => res.status(200).json({ success: true, data: [] }));
  app.post("/api/trains", (req, res) => res.status(201).json({ success: true, data: { trainNumber: req.body.trainNumber } }));

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  });

  return app;
};

module.exports = {
  buildTestApp,
};
