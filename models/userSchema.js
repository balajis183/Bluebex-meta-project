const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // Will become true after OTP verification
    },
    companyName: {
      type: String,
      trim: true,
      required: true, 
    },
    firebaseToken: {
      type: String,
      trim: true,
      default: null,
    },
    appVersion: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin", // default to admin for registration
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
