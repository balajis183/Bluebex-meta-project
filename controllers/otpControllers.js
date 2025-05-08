const Otp = require("../models/otpSchema");
const User = require("../models/userSchema");
const generateToken = require("../utils/generateToken");

const allowedAdminPhones = [
  "9108105199",   //dev
  "9886059754",   //jothis m'aam
  "9164949099",   //jithin sir
  "9148161312",   //jijo sir
  "9809229912",   //jijo 2
  "9618863286",  //dev 
  "9380386090"   //dev
];

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

  // Check if the phone number is in the allowed admin list
  const isAllowedAdmin = allowedAdminPhones.includes(phoneNumber);
    if (!isAllowedAdmin) {
    return res.status(403).json({ message: "You are not authorized to register as admin" });
  }
  
      // Prevent duplicate users
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = new User({
        phoneNumber,
        name: otpRecord.name || "User",
        companyName: otpRecord.companyName || "Unknown Company or Role is User",
        firebaseToken: otpRecord.firebaseToken || "",
        appVersion: otpRecord.appVersion || "",
        isVerified: true,
      });

      await newUser.save();
      await Otp.deleteOne({ phoneNumber });

      return res
        .status(201)
        .json({
          message: "Admin registered successfully",
          name: newUser.name,
          phoneNumber: newUser.phoneNumber,
          companyName: newUser.companyName,
        });
    }

    if (mode === "login") {
      const user = await User.findOneAndUpdate(
        { phoneNumber },
        { isVerified: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found"});
      }

      await Otp.deleteOne({ phoneNumber });

      // console.log(user.role);
      const token = generateToken(user._id , user.role);

      return res.status(200).json({
        message: "Login successful",
        user,
        token,
      });
    }

    return res.status(400).json({ message: "Invalid mode" });
  } catch (err) {
    console.error("OTP verification error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  verifyOtp,
};
