// /backend/controllers/mcqController.js
const fs = require("fs");
const axios = require("axios");
const pdf = require("pdf-parse");
const { extractRawText } = require("docx-parser");

// This controller will handle the logic for generating MCQs
const generateMCQFromFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  /* 1. Extract text from file */
  const filePath = req.file.path;
  let extractedText = "";

  try {
    console.log(`Processing file: ${req.file.originalname}`);

    if (req.file.mimetype === "application/pdf") { // for pdf files
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else if ( // for docx files
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const data = await extractRawText(filePath);
      extractedText = data.value;
    } else if (req.file.mimetype === "text/plain") { // for txt files
      extractedText = fs.readFileSync(filePath, "utf8");
    } else { // other file types
      throw new Error("Unsupported file type.");
    }

    if (!extractedText || extractedText.trim().length < 100) {
      return res
        .status(422)
        .json({
          message:
            "Could not extract sufficient text from the document. Please ensure it has at least 100 characters.",
        });
    }
    console.log("Text extracted successfully. Length:", extractedText.length);
  /* Text Extraction End */

  /* 2. Call our Python MCQ_Service */
    const mcqServiceUrl = process.env.MCQ_SERVICE_URL;
    console.log(`Calling MCQ Service at: ${mcqServiceUrl}`);

    const response = await axios.post(mcqServiceUrl, {
      text: extractedText,
      num_questions: 5, // Can be made dynamic via req.body later
    });

  /* MCQ_Service End */

  /* 3. Send the Response back to the Client */
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in mcqController:", error.message);
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An internal server error occurred.";
    res.status(statusCode).json({ message });
  /*Response End */
  } finally {
  
  /* Clean up the uploaded file from the temp directory */
    fs.unlink(filePath, (err) => {
      if (err)
        console.error(`Failed to delete temporary file: ${filePath}`, err);
    });
  }
  /* Clean up End */

};

module.exports = {
  generateMCQFromFile,
};
