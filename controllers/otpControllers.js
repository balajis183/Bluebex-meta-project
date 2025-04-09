const Otp = require("../models/otpSchema");
const User = require("../models/userSchema");
const generateToken = require("../utils/generateToken");

// Helper to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Send OTP (mock)
const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save or update OTP in MongoDB
    const savedOtp = await Otp.findOneAndUpdate(
      { phoneNumber },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`📲 OTP for ${phoneNumber} is: ${otpCode}`);
    console.log("📦 OTP saved in MongoDB:", savedOtp);

    res.status(200).json({ message: "OTP sent successfully (mock)" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, mode } = req.body;

    const otpRecord = await Otp.findOne({ phoneNumber });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (mode === "register") {
      // Don't allow duplicate users
      const existing = await User.findOne({ phoneNumber });
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = new User({
        phoneNumber,
        name: otpRecord.name,
        isVerified: true,
      });

      await newUser.save();
      await Otp.deleteOne({ phoneNumber });

      return res.status(201).json({ message: "User registered successfully" });
    }

    if (mode === "login") {
      const user = await User.findOneAndUpdate(
        { phoneNumber },
        { isVerified: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await Otp.deleteOne({ phoneNumber });

      const token = generateToken(user._id);

      return res.status(200).json({
        message: "Login successful",
        user,
        token,
      });
    }

    res.status(400).json({ message: "Invalid mode" });
  } catch (err) {
    console.error("Verify OTP error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
