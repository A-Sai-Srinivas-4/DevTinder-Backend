const User = require("../models/user");
const jwt = require("jsonwebtoken"); // For generating and verifying JWT tokens

// Define a middleware function to authenticate a user based on a JWT token in a cookie
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized access..!",
      });
    }

    // Verify the JWT token
    const decodedObj = jwt.verify(token, process.env.SECRET_KEY);

    // Find the user associated with the decoded token
    const user = await User.findById(decodedObj.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    // Attach the user object to the request object
    req.user = user;

    // Pass control to the next middleware
    next();
  } catch (error) {
    res.status(400).json({
      message: "Authentication failed..!",
      error: error.message,
    });
  }
};

module.exports = { userAuth };
