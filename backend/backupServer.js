// /backend/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const pdf = require("pdf-parse");
const { extractRawText } = require("docx-parser"); // Using a community docx parser

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- File Upload Configuration (Multer) ---
// We'll store uploaded files temporarily in a directory named 'uploads'
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// --- API Endpoint to Generate MCQs ---
app.post(
  "/api/mcq/generate-mcq-from-file",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = req.file.path;
    let extractedText = "";

    try {
      // 1. Extract text based on file type
      console.log(`Processing file: ${req.file.originalname}`);
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        extractedText = data.text;
      } else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const data = await extractRawText(filePath);
        extractedText = data.value;
      } else if (req.file.mimetype === "text/plain") {
        extractedText = fs.readFileSync(filePath, "utf8");
      } else {
        throw new Error("Unsupported file type.");
      }

      if (!extractedText || extractedText.trim().length < 100) {
        throw new Error(
          "Could not extract sufficient text from the document. Please ensure the document has at least 100 characters of text."
        );
      }

      console.log("Text extracted successfully. Length:", extractedText.length);

      // 2. Call our Python MCQ_Service
      const mcqServiceUrl =
        process.env.MCQ_SERVICE_URL || "http://127.0.0.1:8000/generate";
      console.log(`Calling MCQ Service at: ${mcqServiceUrl}`);

      const response = await axios.post(mcqServiceUrl, {
        text: extractedText,
        num_questions: 5, // We can make this dynamic later
      });

      // 3. Send the response back to the client
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error in /api/generate-mcq-from-file:", error.message);
      const statusCode = error.response?.status || 500;
      const message =
        error.response?.data?.detail ||
        error.message ||
        "An internal server error occurred.";
      res.status(statusCode).json({ message });
    } finally {
      // 4. Clean up the uploaded file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete temporary file: ${filePath}`, err);
        }
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Node.js backend server running on http://localhost:${PORT}`);
});
