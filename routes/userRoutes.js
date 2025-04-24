const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getAllUsers , addUser } = require("../controllers/userControllers");
const verifyToken= require("../middlewares/verifyToken");
const verifyAdmin=require("../middlewares/verifyAdmin")

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

router.get("/get-all-users",getAllUsers);

router.post("/admin/add-user", verifyToken, verifyAdmin, addUser);

module.exports = router;
