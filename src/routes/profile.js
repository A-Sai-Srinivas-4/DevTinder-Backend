const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
  validateProfileData,
  validateProfilePassword,
} = require("../utils/validation");
const { getEncryptedPassword } = require("../utils/common");

// ---------->  Routes <---------- //

// ------> View Profile <----- //
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (user) {
      res.status(200).json({
        message: "Profile found successfully",
        data: user,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Profile not found",
      error: error.message,
    });
  }
});

// ------> Update Profile and Password Update <----- //
profileRouter.patch("/profile/update", userAuth, async (req, res) => {
  try {
    // Validate the update request before updating the profile
    if (!validateProfileData(req)) {
      return res.status(400).json({
        message: "Invalid update request",
      });
    }

    // Get the logged-in user
    const loggedUser = req.user;

    if (loggedUser) {
      // Update the user profile with the provided data
      Object.keys(req.body).forEach((key) => {
        loggedUser[key] = req.body[key];
      });

      // Save the updated user profile to the database
      await loggedUser.save();

      res.status(200).json({
        message: `${loggedUser.firstName} your profile updated successfully..!`,
        data: loggedUser,
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
});

// ------> Update Profile Password <----- //
profileRouter.patch("/profile/password/update", userAuth, async (req, res) => {
  try {
    if (validateProfilePassword(req)) {
      const loggedUser = req.user;
      if (loggedUser) {
        const { newPassword } = req.body;
        // Encrypt the new password before saving it to the database
        loggedUser.password = await getEncryptedPassword(newPassword);

        loggedUser.save();
        res.status(200).json({
          message: `${loggedUser.firstName} your profile password updated successfully...!`,
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      message: `${req.user.firstName} your profile password update failed`,
      error: error.message,
    });
  }
});

module.exports = profileRouter;
