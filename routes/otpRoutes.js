const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../controllers/otpControllers");

// Route to send OTP
router.post("/send", sendOtp);

// Route to verify OTP
router.post("/verify", verifyOtp);

module.exports = router;
