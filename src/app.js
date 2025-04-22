// Import necessary modules
const express = require("express"); 
const connectDB = require("./config/database"); 
const cookieParser = require("cookie-parser");

// Create an instance of Express
const app = express(); 

// Middlewares 
app.use(express.json()); // parse JSON request bodies 
app.use(cookieParser()); // parse cookies

// Import the routes 
const authRouter = require("./routes/auth"); 
const profileRouter = require("./routes/profile"); 
const requestRouter = require("./routes/request"); 
const userRouter = require("./routes/user"); 


// Use the routes
app.use("/", authRouter); 
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

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
