const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const connectDB = async () => {
    // console.log("URL",process.env.MONGODB_URL) 
    const db = process.env.MONGODB_URL.split("/").pop()
    console.log("DATABASE NAME ",db)
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected")
    } catch (err) {
        console.log("DB is not connected", err.message)
    }
}
// connectDB()
module.exports = connectDB;    