const express = require("express");
const router = express.Router();
const { verifyOtp } = require("../controllers/otpControllers");

router.post("/verify", verifyOtp);

module.exports = router;
