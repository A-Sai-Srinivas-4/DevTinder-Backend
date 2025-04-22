const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName age gender about skills";

// ---------->  Routes <---------- //

// ------> User Requests Received <----- //
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // find all pending connection requests for the logged in user
    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    res.status(200).json({
      message: "User requests found successfully",
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).json({
      message: "User requests not found",
      error: error.message,
    });
  }
});

// ------> User Connections <----- //
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    // find all pending connection requests for the logged in user
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // Explain : The below code is to extract the user data from the connection requests and return it
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).json({
      message: "Connections Requests fetched Successfully...!",
      data: data,
    });
  } catch (error) {
    res.status(400).json({
      message: "User connections not found",
      error: error.message,
    });
  }
});

// ------> Feed <----- //
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // User should see all t he user cards except
    // 0. his own card
    // 1. his connections
    // 2. ignored people
    // 3. already sent connection requests
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Find all connecton requests for the logged in user
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id },
        {
          toUserId: loggedInUser._id,
        },
      ],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(hideUsersFromFeed) },
        },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Feed found successfully",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      message: "Feed not found",
      error: error.message,
    });
  }
});

module.exports = userRouter;
