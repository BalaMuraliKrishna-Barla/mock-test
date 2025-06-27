// /backend/routes/mcqRoutes.js
const express = require("express");
const { generateMCQFromFile } = require("../controllers/mcqController");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware"); 


const router = express.Router();

// POST /api/mcq/generate-from-file
router.post("/generate-mcq-from-file",protect, upload.single("file"), generateMCQFromFile);

module.exports = router;
