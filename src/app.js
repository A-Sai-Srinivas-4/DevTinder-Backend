// Import necessary modules
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import the routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

// Create an instance of Express
const app = express();

// Adds headers: Access-Control-Allow-Origin: *
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Middlewares
app.use(express.json()); // parse JSON request bodies
app.use(cookieParser()); // parse cookies

const API = "/api";
// Use the routes
app.use(`${API}/auth`, authRouter);
app.use(API, profileRouter);
app.use(API, requestRouter);
app.use(API, userRouter);

// Error handling middleware
app.use("/", (err, req, res) => {
  console.log("Global error handler", err);
  res.status(400).json({
    message: err.message,
  });
});

// Start the server
connectDB()
  .then(() => {
    console.log("Database connected");
    const PORT = process.env.PORT || 3003;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed", error);
  });
