// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const authRoutes = require("../routes/authRoutes");

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.use("/api", authRoutes);

// // // Start the server
// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // module.exports = app; // Export the app for Vercel
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Import routes
const authRoutes = require("../../routes/authRoutes");
app.use("/api", authRoutes);

module.exports = app;
