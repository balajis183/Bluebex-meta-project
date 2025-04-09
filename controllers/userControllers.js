const User = require("../models/userSchema");
const Otp = require("../models/otpSchema");


// controllers/userController.js
const registerUser = async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Store name temporarily in OTP collection for registration
    const otpData = await Otp.findOneAndUpdate(
      { phoneNumber },
      { name }, // Store name for user creation later
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "OTP sent for registration (mock)" });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please register first." });
    }

    // Just respond with success message, actual OTP sent in `sendOtp`
    res.status(200).json({ message: "OTP sent for login (mock)" });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  registerUser,
  loginUser,
};
