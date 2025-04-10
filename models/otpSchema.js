const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      default: null, 
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Otp", otpSchema);
