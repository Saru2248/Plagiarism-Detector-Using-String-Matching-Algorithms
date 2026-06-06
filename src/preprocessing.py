import re
import os

def read_file(file_path):
    """
    Reads the content of a text file.
    
    Args:
        file_path (str): Absolute or relative path to the file.
        
    Returns:
        str: File content or empty string if error occurs.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def clean_text(text):
    """
    Cleans text by converting to lowercase and removing special characters/punctuation
    while preserving spacing and alphanumeric characters.
    
    Args:
        text (str): Input raw text.
        
    Returns:
        str: Cleaned text.
    """
    # Convert to lowercase
    text = text.lower()
    # Replace newlines, tabs, and carriage returns with a space
    text = re.sub(r'[\r\n\t]+', ' ', text)
    # Remove special characters/punctuation except spaces and alphanumeric
    text = re.sub(r'[^a-z0-9\s]', '', text)
    # Collapse multiple spaces into a single space and strip leading/trailing spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def split_into_sentences(text):
    """
    Splits text into raw sentences based on punctuation (. ! ?).
    
    Args:
        text (str): Input raw text.
        
    Returns:
        list: List of raw non-empty sentences.
    """
    # Simple regex to split sentences while maintaining structure
    sentences = re.split(r'(?<=[.!?])\s+', text)
    # Clean out any empty strings or solely whitespace entries
    return [s.strip() for s in sentences if s.strip()]

def tokenize_words(cleaned_text):
    """
    Splits cleaned text into individual words (tokens).
    
    Args:
        cleaned_text (str): Cleaned text (no punctuation).
        
    Returns:
        list: List of word tokens.
    """
    return [word for word in cleaned_text.split(' ') if word]

def preprocess_document(text):
    """
    Fully preprocesses a document.
    1. Splits it into raw sentences.
    2. Cleans each sentence for exact/near-exact matching.
    3. Tokenizes the entire document's words for global similarity.
    
    Args:
        text (str): Input raw document text.
        
    Returns:
        dict: A dictionary containing:
            - 'raw_sentences': list of raw sentences
            - 'cleaned_sentences': list of preprocessed sentences
            - 'cleaned_full_text': full cleaned text string
            - 'tokens': list of word tokens
    """
    raw_sentences = split_into_sentences(text)
    cleaned_sentences = [clean_text(s) for s in raw_sentences]
    # Filter out sentences that became empty after cleaning (e.g. only symbols)
    valid_indices = [i for i, cs in enumerate(cleaned_sentences) if len(cs) > 0]
    
    filtered_raw = [raw_sentences[i] for i in valid_indices]
    filtered_cleaned = [cleaned_sentences[i] for i in valid_indices]
    
    cleaned_full = clean_text(text)
    tokens = tokenize_words(cleaned_full)
    
    return {
        'raw_sentences': filtered_raw,
        'cleaned_sentences': filtered_cleaned,
        'cleaned_full_text': cleaned_full,
        'tokens': tokens
    }
