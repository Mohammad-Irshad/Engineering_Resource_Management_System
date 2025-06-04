const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const engineerRoutes = require("./routes/engineers");
const projectRoutes = require("./routes/projects");
const assignmentRoutes = require("./routes/assignments");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

//Welcome api

app.use("/", (req, res) => {
  res.send("Welcome to Mohammad Irshad's Server");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/engineers", engineerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/assignments", assignmentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
