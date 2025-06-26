# /MCQ_Service/app.py
import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional

# Local imports
import config
from mcq_generator import generate_mcqs_from_text

# --- FastAPI App Initialization ---
logger = logging.getLogger(__name__)
app = FastAPI(
    title="AutoMCQ 2.0 - MCQ Service",
    description="An API for generating Multiple-Choice Questions from text using AI.",
    version="1.0.0"
)

# --- Pydantic Models for Request & Response ---
class MCQRequest(BaseModel):
    text: str = Field(..., min_length=100, description="The source text to generate MCQs from. Should be at least 100 characters.")
    num_questions: int = Field(default=5, gt=0, le=10, description="The number of MCQs to generate (1-10).")

# --- API Endpoints ---

@app.get("/", tags=["Health Check"])
async def health_check():
    """
    Simple health check endpoint to confirm the service is running.
    """
    logger.info("Health check endpoint was called.")
    return {"status": "ok", "message": "MCQ Service is running."}

@app.post("/generate", tags=["MCQ Generation"])
async def create_mcqs(request: MCQRequest):
    """
    Receives text and generates Multiple-Choice Questions.
    This is the core endpoint of the service.
    """
    logger.info(f"Received request to generate {request.num_questions} MCQs.")
    try:
        # Call the main generation logic from our generator module
        mcqs = await generate_mcqs_from_text(request.text, request.num_questions)
        
        if not mcqs:
            logger.warning("MCQ generation resulted in an empty list.")
            raise HTTPException(
                status_code=422, # Unprocessable Entity
                detail="Could not generate MCQs from the provided text. The text might be unsuitable or too short."
            )
        
        logger.info(f"Successfully returning {len(mcqs)} MCQs to the client.")
        return JSONResponse(
            status_code=200,
            content={"status": "success", "mcqs": mcqs}
        )

    except ConnectionError as e:
        logger.critical(f"Connection Error: {e}")
        raise HTTPException(status_code=503, detail=f"Service Unavailable: {str(e)}")
    except ValueError as e:
        logger.error(f"Value Error / Invalid format from LLM: {e}")
        raise HTTPException(status_code=500, detail=f"Data Processing Error: {str(e)}")
    except Exception as e:
        logger.error(f"An unexpected error occurred in /generate endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

# --- To run the server (for development) ---
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server for development...")
    uvicorn.run(app, host="0.0.0.0", port=8000)