const User = require("../models/userSchema");
const Otp = require("../models/otpSchema");
const sendOtpVia2Factor = require("../utils/otpService");


// const HASH_KEY = "YourHashKeyGoesHere";
const HASH_KEY = process.env.HASH_KEY;

const allowedAdminPhones = [
  "9108105199",
  "9886059754",
  "9164949099",
  "9148161312",
  "9809229912",
  "9618863286",
  "9380386090"
];


//  Registration Flow
const registerUser = async (req, res) => {
  try {
    const { phoneNumber, name , companyName, firebaseToken, appVersion  } = req.body;

 //check whether the phonenumber is allowed to register as admin
if (!allowedAdminPhones.includes(phoneNumber)) {
  return res.status(403).json({ message: "You are not authorized to register as admin" });
}


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
    const users = await User.find({role:"user"}).select("-__v");   // exclude __v
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};



// Get All Admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-__v"); // Filter by role: 'admin' and exclude __v
    res.status(200).json({ admins });
  } catch (err) {
    console.error("Error fetching admins:", err.message);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};


const getProfile = async (req, res) => {
  const { phoneNumber } = req.params;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const user = await User.findOne({ phoneNumber }).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  addUser,
  getAllAdmins,
  getProfile
};
