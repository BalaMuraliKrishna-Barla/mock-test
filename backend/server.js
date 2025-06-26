// /backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// --- Import Routes ---
const mcqRoutes = require("./routes/mcqRoutes");

// --- Connect to Database ---
// We call this now to prepare for the authentication step.
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Core Middleware ---
// Enable CORS for all origins, useful for development
app.use(cors({ origin: "*" }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
// Any request to /api/mcq will be handled by mcqRoutes
app.use("/api/mcq", mcqRoutes);

// --- Simple Root Route for Health Check ---
app.get("/", (req, res) => {
  res.send("AutoMCQ Backend is running successfully!");
});

app.listen(PORT, () => {
  console.log(`Node.js backend server running on http://127.0.0.1:${PORT}`);
});
