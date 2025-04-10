const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getAllUsers } = require("../controllers/userControllers");

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

router.get("/get-all-users",getAllUsers);

module.exports = router;
