// Import necessary modules
const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const { getEncryptedPassword } = require("../utils/common");
const User = require("../models/user");

// Create an instance of Express
const authRouter = express.Router();

// ---------->  Routes <---------- //

// ------> Signup --> Create a new user account and encrypt the password before saving it to the database <----- //
authRouter.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    // Validate the data before creating the user account
    validateSignUpData(req);

    // Encrypt the password before saving the user account
    const { password } = req.body;
    user.password = await getEncryptedPassword(password);

    // Save the user account to the database
    await user.save();

    // Send a success response to the client
    res.status(200).json({
      message: "User created successfully",
    });
  } catch (error) {
    // Send an error response to the client
    res.status(500).json({
      message: "User creation failed",
      error: error.message,
    });
  }
});

// ------> Login --> Authenticate a user account and generate a JWT token <----- //
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Find the user account in the database based on the provided email Id
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // Generate a JWT token for the authenticated user
      const token = await user.getJWT();

      // Send the JWT token as a response to the client in a cookie with an expiration date of 1 hour
      res.cookie("token", token, {
        expires: new Date(Date.now() + 1 * 3600000),
      });

      res.status(200).json({
        message: "Login successful",
        data: user,
      });
    } else {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// ------> Logout --> Remove the JWT token from the client's cookie and send a logout success response to the client <----- //
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logout successful",
  });
});

module.exports = authRouter;
