require("dotenv").config();
const express = require("express")
const mongoose = require("mongoose")
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const staffRouter = require("./routes/staffRoutes");

const app = express()
app.use(express.json());
app.use('/user',userRouter);
// app.use('/admin',adminRouter);
// app.use('/staff',staffRouter);


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