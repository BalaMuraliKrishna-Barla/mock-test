const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const splitTextIntoChunks = (text, chunkSize = 8000) => {
  const sentences = text.split("\n");
  let chunks = [];
  let currentChunk = "";

  for (let sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
    currentChunk += sentence + "\n";
  }

  if (currentChunk.length) chunks.push(currentChunk);
  return chunks;
};


const formatTextWithChatGPT = async (text) => {
  const chunks = splitTextIntoChunks(text);
  let formattedMCQs = [];

  for (const chunk of chunks) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Extract multiple-choice questions (MCQs) from text and format them into valid JSON.",
          },
          {
            role: "user",
            content: `Convert this text into a structured JSON format with the following structure:
            
            {
              "questions": [
                {
                  "question": "Your question here",
                  "options": { "A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4" },
                  "correctAnswer": "A"
                }
              ]
            }
            
            Now format the following text into this JSON format:
            """${chunk}"""`,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });

      let responseText = response.choices[0].message.content;

      responseText = responseText.replace(/```json|```/g, "").trim();

      let extractedData;
      try {
        extractedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Error parsing JSON:", parseError);
        console.error("🔍 Raw API Response:", responseText);
        continue; 
      }

      if (Array.isArray(extractedData)) {
        formattedMCQs.push(...extractedData);
      } else if (
        extractedData.questions &&
        Array.isArray(extractedData.questions)
      ) {
        formattedMCQs.push(...extractedData.questions); 
      } else {
        console.warn(
          "⚠️ Extracted data is not an array, skipping:",
          extractedData
        );
      }
    } catch (error) {
      console.error("❌ Error processing chunk:", error);
    }
  }

  return formattedMCQs;
};


const processFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let text = "";
    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (req.file.mimetype.includes("wordprocessingml")) {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = data.value;
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    const mcqs = await formatTextWithChatGPT(text.trim());
    res.json({ questions: mcqs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing file", error: error.message });
  }
};

module.exports = { processFile };
