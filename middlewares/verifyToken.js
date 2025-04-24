const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];    // Extract token from Authorization header
  
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);      // Verify the token
    req.user = decoded;                                             // Attach decoded user data (id, role) to the request object
    next();                                                        // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" , error: err.message });
  }
};

module.exports = verifyToken;
