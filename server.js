// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(express.json());


const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI); // Use environment variable for security
      console.log("✅ Connected to MongoDB");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err.message);
    }
  };


  const otpRoutes = require("./routes/otpRoutes");
  const userRoutes = require("./routes/userRoutes");

app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);

  

// Root Route
app.get("/", (req, res) => {
  res.send("✅ Server is up and running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://15.206.226.196`);
  connect();  //connection to datbase
});
