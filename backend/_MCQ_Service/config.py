# /MCQ_Service/config.py
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Gemini API Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.")

GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"

# --- Logging Configuration ---
LOGGING_LEVEL = os.getenv('LOGGING_LEVEL', 'INFO').upper()
logging.basicConfig(
    level=LOGGING_LEVEL,
    format='%(asctime)s - %(levelname)s - [%(name)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Application Constants ---
# Max characters to process. Prevents extremely long inputs from bogging down the system or costing too much.
# Let's set it to 50,000 chars, which is roughly 10k tokens or ~20 pages.
MAX_TEXT_LENGTH = 50000 