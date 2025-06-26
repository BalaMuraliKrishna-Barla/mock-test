# /MCQ_Service/mcq_generator.py
import json
import logging
from google.generativeai import GenerativeModel, configure
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Local imports
import config
from prompts import get_mcq_generation_prompt, MCQ_GENERATION_SYSTEM_PROMPT
from text_processor import clean_text, chunk_text

# --- Configure the Gemini Model ---
logger = logging.getLogger(__name__)

try:
    configure(api_key=config.GEMINI_API_KEY)
    
    # Safety settings to reduce the chances of the API blocking responses.
    # Adjust as needed for your content.
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }

    generation_config = {
        "temperature": 0.7,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json", # Crucial for getting JSON output
    }

    model = GenerativeModel(
        model_name=config.GEMINI_MODEL_NAME,
        generation_config=generation_config,
        safety_settings=safety_settings,
        system_instruction=MCQ_GENERATION_SYSTEM_PROMPT,
    )
    logger.info("Gemini Model configured successfully.")
except Exception as e:
    logger.critical(f"Failed to configure Gemini Model: {e}")
    model = None

# --- Main MCQ Generation Function ---
async def generate_mcqs_from_text(text: str, num_questions: int) -> list:
    """
    The main function to generate MCQs from a given text.
    """
    if not model:
        raise ConnectionError("Gemini Model is not available or configured.")

    if not text or not text.strip():
        logger.warning("Input text is empty. Cannot generate MCQs.")
        return []

    # 1. Clean and truncate the input text
    text = clean_text(text)
    if len(text) > config.MAX_TEXT_LENGTH:
        logger.warning(f"Input text exceeds max length. Truncating to {config.MAX_TEXT_LENGTH} characters.")
        text = text[:config.MAX_TEXT_LENGTH]

    # 2. Chunk the text
    # For now, we'll just process the first chunk to keep the MVP simple and fast.
    # In a full implementation, you might loop through chunks or select them randomly.
    chunks = chunk_text(text)
    if not chunks:
        logger.error("Text chunking resulted in no chunks. Cannot proceed.")
        return []
    
    first_chunk = chunks[0]
    logger.info(f"Processing the first chunk of text ({len(first_chunk)} chars) for MCQ generation.")

    # 3. Get the prompt for the LLM
    prompt = get_mcq_generation_prompt(first_chunk, num_questions)
    
    # 4. Call the LLM and get the response
    try:
        logger.info("Sending request to Gemini API...")
        response = await model.generate_content_async(prompt)
        
        # 5. Parse and validate the response
        response_text = response.text
        logger.info("Received response from Gemini API.")
        
        # The model is configured to return JSON, so we parse it directly.
        data = json.loads(response_text)
        
        if "mcqs" in data and isinstance(data["mcqs"], list):
            logger.info(f"Successfully generated {len(data['mcqs'])} MCQs.")
            return data["mcqs"]
        else:
            logger.error(f"LLM response is not in the expected format. Response: {response_text[:200]}...")
            raise ValueError("Invalid JSON structure received from LLM.")

    except json.JSONDecodeError:
        logger.error(f"Failed to decode JSON from LLM response. Response text: {response.text[:500]}...")
        raise ValueError("LLM did not return valid JSON.")
    except Exception as e:
        logger.error(f"An unexpected error occurred during Gemini API call: {e}")
        # Re-raising the exception to be handled by the API endpoint
        raise e