// /backend/routes/mcqRoutes.js
const express = require("express");
const { generateMCQFromFile } = require("../controllers/mcqController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// POST /api/mcq/generate-from-file
router.post("/generate-mcq-from-file", upload.single("file"), generateMCQFromFile);

module.exports = router;
