const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// ---------->  Routes <---------- //
// ------> Send Connection Request <----- //
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { toUserId, status } = req.params;

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status,
        });
      }

      // Find the user to which the connection request is being sent
      const toUser = await User.findById(toUserId);

      if (!toUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // NOTE: This is to prevent duplicate connection requests being sent between two users
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "Connection Request Already Exists...!",
        });
      }

      // Create a new connection request document
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      // Save the connection request to the database
      const data = await connectionRequest.save();

      // Send a success response to the client
      res.status(200).json({
        message: `${req.user.firstName} is ${status} ${status === "interested" ? "in" : "by"}  ${toUser.firstName}`,
        data,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to send connection request",
        error: error.message,
      });
    }
  }
);

// ------> Review Connection Request <----- //
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type: " + status,
        });
      }

      // Find the connection request in the database based on the provided request ID and the logged-in user ID and status type
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(400).json({
          message: "Connection request not found",
        });
      }

      // Update the status of the connection request in the database to the provided status type
      connectionRequest.status = status;
      // Save the updated connection request to the database
      const data = await connectionRequest.save();
      res.status(200).json({
        message: `${loggedInUser.firstName} is ${status} your connection request..!`,
        data,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to send connection request",
        error: error.message,
      });
    }
  }
);

module.exports = requestRouter;
