


const jwt = require("jsonwebtoken");

const authenticateRequest = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get Bearer token

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required! Please login to continue",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    //console.log("Decoded JWT:", decoded);

    
    if (!decoded.accountId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: No accountId found",
      });
    }

    req.user = { accountId: decoded.accountId }; 
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticateRequest };
