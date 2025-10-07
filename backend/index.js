require("dotenv").config();
const cors = require("cors");
const express = require("express")
const mongoose = require("mongoose")
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const staffRouter = require("./routes/staffRoutes");
const foodRouter = require("./routes/foodRoutes");

const app = express()
app.use(cors());
app.use(express.json());
app.use('/user',userRouter);
// app.use('/admin',adminRouter);
// app.use('/staff',staffRouter);
app.use('/food',foodRouter)
app.get('/',(req,res)=>{
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