const verifyAdmin = (req, res, next) => {
    
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      console.error(`Access denied: User ${req.user.id} is not an admin.`);
      
      return res.status(403).json({
        message: "Access denied",
        error: "Admin role is required to access this resource."
      });
    }
  
    // Proceed to the next middleware if the user is an admin
    next();
  };
  
  module.exports = verifyAdmin;
  