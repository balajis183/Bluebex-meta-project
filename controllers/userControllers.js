const User = require("../models/userSchema");
const Otp = require("../models/otpSchema");
const sendOtpVia2Factor = require("../utils/otpService");


// const HASH_KEY = "YourHashKeyGoesHere";
const HASH_KEY = process.env.HASH_KEY;


//  Registration Flow
const registerUser = async (req, res) => {
  try {
    const { phoneNumber, name , companyName, firebaseToken, appVersion  } = req.body;

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
        companyName,
        firebaseToken,
        appVersion
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "OTP sent successfully for registration", phoneNumber, status:"success", details: otpResult.details,});
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

    res.status(200).json({ message: "OTP sent successfully for login" ,phoneNumber,name:user.name, status:"success", details: otpResult.details,});
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

//Adding the user by admin
const addUser = async (req, res) => {
  const { name, phoneNumber,companyName} = req.body;

  // Ensure name and phoneNumber are provided
  if (!name || !phoneNumber) {
    return res.status(400).json({ message: "Name and phone number are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user with default role as 'user'
    const newUser = new User({
      name,
      phoneNumber,
      role: 'user',  // Default role for new users
      companyName: companyName || "CompanyName not required for users",
    });

    // Save new user to the database
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: "User added successfully", newUser });
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).json({ message: "Server error" , error : error.message });
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
  getAllUsers,
  addUser
};
