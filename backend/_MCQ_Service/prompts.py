# /MCQ_Service/prompts.py

MCQ_GENERATION_SYSTEM_PROMPT = """
You are an expert AI assistant specializing in educational content creation. Your task is to generate high-quality, multiple-choice questions (MCQs) from a given text.
You must adhere strictly to the provided text and the specified JSON output format.
"""

def get_mcq_generation_prompt(text_chunk: str, num_questions: int) -> str:
    """
    Generates the user prompt for the LLM to create MCQs.
    """
    return f"""
**Context Text:**
---
{text_chunk}
---

**Task:**
Based strictly on the provided "Context Text", generate {num_questions} multiple-choice question(s).

**Instructions & JSON Output Format:**
Your entire response MUST be a single, valid JSON object. This object should contain one key, "mcqs", which is an array of question objects.
Do NOT include any text or formatting outside of this JSON object.

Each question object in the "mcqs" array must have the following structure and keys:
1.  `question` (string): The question text.
2.  `options` (object): An object with four keys: "A", "B", "C", and "D". Each key's value is a plausible option string.
3.  `correct_option_key` (string): The key ("A", "B", "C", or "D") corresponding to the correct answer in the `options` object.
4.  `explanation` (string): A brief but clear explanation of why the correct option is right, referencing the context text.
5.  `confidence_score` (float): A score from 0.0 to 1.0 indicating your confidence in the quality and accuracy of the generated question and its options.

**Example of the required JSON output format:**
```json
{{
  "mcqs": [
    {{
      "question": "What is the primary function of the mitochondria?",
      "options": {{
        "A": "To store genetic information",
        "B": "To synthesize proteins",
        "C": "To generate most of the cell's supply of ATP",
        "D": "To control cell division"
      }},
      "correct_option_key": "C",
      "explanation": "The context states that the mitochondria generates most of the cell's supply of adenosine triphosphate (ATP), which is used as a source of chemical energy.",
      "confidence_score": 0.95
    }}
  ]
}}
"""