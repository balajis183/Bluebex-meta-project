const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId , role:role}, process.env.JWT_SECRET, {
    expiresIn: "1y", // or "1h", "30m", etc.
  });
};

module.exports = generateToken;
