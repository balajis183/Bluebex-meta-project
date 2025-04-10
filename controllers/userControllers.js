const User = require("../models/userSchema");
const Otp = require("../models/otpSchema");
const sendOtpVia2Factor = require("../utils/otpService");


// const HASH_KEY = "YourHashKeyGoesHere";
const HASH_KEY = process.env.HASH_KEY;


//  Registration Flow
const registerUser = async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otpResult = await sendOtpVia2Factor(phoneNumber, HASH_KEY);

    if (otpResult.status !== "success") {
      return res.status(500).json({ message: "OTP sending failed" });
    }

    // Save OTP + name to DB

    await Otp.findOneAndUpdate(
      { phoneNumber },
      {
        otp: otpResult.otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
        name,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "OTP sent successfully for registration" });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Flow
const loginUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    const otpResult = await sendOtpVia2Factor(phoneNumber, HASH_KEY);

    if (otpResult.status !== "success") {
      return res.status(500).json({ message: "OTP sending failed" });
    }

    // Save OTP to DB (without name)
    await Otp.findOneAndUpdate(
      { phoneNumber },
      {
        otp: otpResult.otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "OTP sent successfully for login" });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};



// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");   // exclude __v
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getAllUsers
};
