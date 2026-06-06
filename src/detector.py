import os
import glob
from src.preprocessing import preprocess_document, read_file
from src.algorithms import (
    naive_search, 
    kmp_search, 
    rabin_karp_search,
    generate_minhash_signature,
    estimate_minhash_similarity
)

def compute_jaccard_similarity(tokens_a, tokens_b):
    """
    Computes Jaccard Similarity between two sets of tokens.
    Jaccard = |A ∩ B| / |A ∪ B|
    """
    set_a = set(tokens_a)
    set_b = set(tokens_b)
    
    if not set_a or not set_b:
        return 0.0
        
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return len(intersection) / len(union)

def compute_containment_score(tokens_sub, tokens_ref):
    """
    Computes Containment Score of the submitted document within the reference document.
    Containment = |A ∩ B| / |A| (where A is submitted, B is reference)
    """
    set_sub = set(tokens_sub)
    set_ref = set(tokens_ref)
    
    if not set_sub:
        return 0.0
        
    intersection = set_sub.intersection(set_ref)
    return len(intersection) / len(set_sub)

def run_plagiarism_detection(original_text, submitted_text, algorithm='kmp'):
    """
    Runs sentence-level plagiarism detection using the selected string matching algorithm.
    """
    # Preprocess both documents
    orig_data = preprocess_document(original_text)
    sub_data = preprocess_document(submitted_text)
    
    orig_clean_full = orig_data['cleaned_full_text']
    sub_raw_sentences = sub_data['raw_sentences']
    sub_clean_sentences = sub_data['cleaned_sentences']
    
    # Store comparison details
    matched_sentences = []
    total_comparisons = 0
    total_collisions = 0
    total_algo_time = 0.0
    plagiarized_word_count = 0
    total_submitted_words = len(sub_data['tokens'])
    
    # Search each sentence of the submitted document in the full cleaned original text
    for idx, clean_sentence in enumerate(sub_clean_sentences):
        # Skip extremely short sentences to avoid false positives
        if len(clean_sentence) < 5 or len(clean_sentence.split()) < 2:
            continue
            
        matches = []
        comparisons = 0
        collisions = 0
        algo_time = 0.0
        
        # Execute the chosen algorithm
        if algorithm == 'naive':
            res = naive_search(orig_clean_full, clean_sentence)
            matches = res['matches']
            comparisons = res['comparisons']
            algo_time = res['time_taken']
        elif algorithm == 'kmp':
            res = kmp_search(orig_clean_full, clean_sentence)
            matches = res['matches']
            comparisons = res['comparisons']
            algo_time = res['time_taken']
        elif algorithm == 'rabin-karp':
            res = rabin_karp_search(orig_clean_full, clean_sentence)
            matches = res['matches']
            comparisons = res['comparisons']
            collisions = res.get('hash_collisions', 0)
            algo_time = res['time_taken']
            
        total_comparisons += comparisons
        total_collisions += collisions
        total_algo_time += algo_time
        
        # If the sentence was found in the original document
        if len(matches) > 0:
            sentence_words = len(clean_sentence.split())
            plagiarized_word_count += sentence_words
            matched_sentences.append({
                'index': idx,
                'raw_text': sub_raw_sentences[idx],
                'cleaned_text': clean_sentence,
                'matches_in_ref': matches,
                'word_count': sentence_words
            })
            
    # Calculate Jaccard Similarity and Containment Score
    jaccard = compute_jaccard_similarity(sub_data['tokens'], orig_data['tokens'])
    containment = compute_containment_score(sub_data['tokens'], orig_data['tokens'])
    
    # Calculate MinHash Signature Approximation (using 50 hash functions)
    sig_orig = generate_minhash_signature(orig_data['tokens'], num_hashes=50)
    sig_sub = generate_minhash_signature(sub_data['tokens'], num_hashes=50)
    minhash_similarity = estimate_minhash_similarity(sig_orig, sig_sub)
    
    # Calculate overall sentence-level plagiarism percentage
    plagiarism_percentage = 0.0
    if total_submitted_words > 0:
        plagiarism_percentage = (plagiarized_word_count / total_submitted_words) * 100.0
        
    return {
        'algorithm_used': algorithm,
        'total_submitted_sentences': len(sub_raw_sentences),
        'matched_sentences_count': len(matched_sentences),
        'matched_sentences': matched_sentences,
        'plagiarism_percentage': round(plagiarism_percentage, 2),
        'jaccard_similarity': round(jaccard * 100, 2),
        'containment_score': round(containment * 100, 2),
        'minhash_similarity': round(minhash_similarity * 100, 2),
        'total_comparisons': total_comparisons,
        'total_collisions': total_collisions,
        'total_execution_time': total_algo_time,
        'submitted_word_count': total_submitted_words,
        'plagiarized_word_count': plagiarized_word_count
    }

def scan_reference_directory(submitted_text, doc_folder='documents', algorithm='kmp'):
    """
    Compares the submitted text against all text files in the specified directory,
    ranking the matches from highest plagiarism rate to lowest.
    
    Args:
        submitted_text (str): Content of the submitted document.
        doc_folder (str): Directory containing reference (.txt) files.
        algorithm (str): String matching algorithm.
        
    Returns:
        list: Sorted list of reference match reports, highest match first.
    """
    if not os.path.exists(doc_folder):
        raise FileNotFoundError(f"Documents directory not found: {doc_folder}")
        
    search_path = os.path.join(doc_folder, "*.txt")
    reference_files = glob.glob(search_path)
    
    reports = []
    for filepath in reference_files:
        filename = os.path.basename(filepath)
        try:
            original_text = read_file(filepath)
            res = run_plagiarism_detection(original_text, submitted_text, algorithm)
            
            reports.append({
                'filename': filename,
                'plagiarism_percentage': res['plagiarism_percentage'],
                'jaccard_similarity': res['jaccard_similarity'],
                'containment_score': res['containment_score'],
                'minhash_similarity': res['minhash_similarity'],
                'matched_sentences_count': res['matched_sentences_count'],
                'total_execution_time_ms': res['total_execution_time'] * 1000.0
            })
        except Exception as e:
            print(f"[!] Error processing {filename}: {e}")
            
    # Sort by plagiarism percentage descending, then by containment score
    reports.sort(key=lambda r: (r['plagiarism_percentage'], r['containment_score']), reverse=True)
    return reports
