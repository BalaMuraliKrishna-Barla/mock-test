1️⃣ Features & Flow
✅ Upload a PDF/Word file containing MCQs
✅ Extract questions & options
✅ Randomly pick 20 questions
✅ Display them in a quiz format
✅ Timer for the test (optional)
✅ Submit & show score at the end

2️⃣ Tech Stack
🟢 Frontend (UI): React + Tailwind/Bootstrap
🟢 Backend: Node.js + Express
🟢 Database (optional): MongoDB (to store test records)
🟢 File Parsing: pdf-parse (for PDFs), mammoth (for Word files)

🔹 Backend Responsibilities (Node.js + Express)
1️⃣ Receive Uploaded File

Handle PDF/Word file upload from the frontend.
Use multer (for handling file uploads).
2️⃣ Extract Questions from Document

Use pdf-parse for PDFs, mammoth for Word files.
Convert the document into text and extract MCQs.
3️⃣ Randomly Select 20 Questions

Process the extracted questions.
Shuffle and pick 20 questions.
4️⃣ Send Questions to Frontend

Return the selected MCQs as a JSON response.
5️⃣ Receive and Evaluate Answers

Accept the user's submitted answers.
Compare them with correct answers and return the score.
6️⃣ (Optional) Store Results in a Database

Save user scores in MongoDB (if you want to track test history).
🔹 Frontend (React) Role
✅ Upload File
✅ Display Quiz
✅ Capture User Answers
✅ Send Answers to Backend
✅ Show Results
