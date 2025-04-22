// Import necessary modules
const mongoose = require("mongoose"); // For MongoDB database integration and schema definition
const validator = require("validator"); // For input validation and data sanitization
const bcrypt = require("bcrypt"); // For password encryption and comparison
const jwt = require("jsonwebtoken"); // For generating and verifying JWT tokens

// Define the user schema using Mongoose
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // validate(value) {
      //   if (!validator.isEmail(value)) {
      //     throw new Error("Invalid email");
      //   }
      // },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      maxLength: 100,
      // validate(value) {
      //   if (!validator.isStrongPassword(value)) {
      //     throw new Error("Weak password");
      //   }
      // },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is not gender type",
      },
      // validate(value) {
      //   if (!["male", "female", "others"].includes(value)) {
      //     throw new Error("Invalid gender");
      //   }
      // },
    },
    about: {
      type: String,
      default: "This is a default about of the user",
    },
    skills: {
      type: [String],
    },
    photoUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Define methods for the user schema
// Define a method to generate a JWT token for a user
userSchema.methods.getJWT = async function () {
  const user = this; // Get the user document from the database
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  return token;
};

// Define a method to validate a user's password and compare it with the hashed password stored in the database
userSchema.methods.validatePassword = async function (UserPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(UserPassword, passwordHash);
  return isPasswordValid;
};

// Export the user schema as a model using Mongoose
module.exports = mongoose.model("user", userSchema);
