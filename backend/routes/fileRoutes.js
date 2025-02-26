const express = require("express");
const multer = require("multer");
const { processFile } = require("../controllers/fileController");

const router = express.Router();

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });


router.post("/upload", upload.single("testFile"), processFile);

module.exports = router;

