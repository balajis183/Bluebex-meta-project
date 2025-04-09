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
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

    await Otp.findOneAndUpdate(
      { phoneNumber },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true }
    );

    // 📦 Replace this with real SMS in production
    console.log(`📲 OTP for ${phoneNumber} is: ${otpCode}`);

    res.status(200).json({ message: "OTP sent successfully (mock)" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Verify OTP & issue JWT
const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const otpRecord = await Otp.findOne({ phoneNumber });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ✅ Update user verification
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Otp.deleteOne({ phoneNumber });

    // 🔐 Create JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "OTP verified successfully",
      user,
      token,
    });
  } catch (err) {
    console.error("❌ Error verifying OTP:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
