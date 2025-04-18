const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h", // or "1h", "30m", etc.
  });
};

module.exports = generateToken;
