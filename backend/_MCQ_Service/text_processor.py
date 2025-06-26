# /MCQ_Service/text_processor.py
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter

def clean_text(text: str) -> str:
    """
    Performs basic text cleaning by normalizing whitespace.
    """
    # Replace multiple newlines with a single one
    text = re.sub(r'\n\s*\n', '\n', text)
    # Replace multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def chunk_text(text: str) -> list[str]:
    """
    Splits a long text into smaller, manageable chunks.
    This is crucial for fitting within the LLM's context window and for generating
    more focused questions from specific parts of the document.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,  # Max characters per chunk
        chunk_overlap=200, # Characters to overlap between chunks
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""], # How to split
    )
    chunks = text_splitter.split_text(text)
    return chunks