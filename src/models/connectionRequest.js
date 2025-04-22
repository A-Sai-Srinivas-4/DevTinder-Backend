const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // reference to the User model
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} is not supported",
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // check if the fromUserId and toUserId are the same
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("You cannot send connection request to yourself");
  }
  next();
});

const connectionRequestModel = mongoose.model(
  "connectionRequest",
  connectionRequestSchema
);
module.exports = connectionRequestModel;
