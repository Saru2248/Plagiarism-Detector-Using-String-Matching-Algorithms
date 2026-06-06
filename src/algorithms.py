import time

def naive_search(text, pattern):
    """
    Brute-force/Naive String Matching algorithm.
    Compares the pattern character-by-character at every possible index of the text.
    
    Args:
        text (str): The main document text.
        pattern (str): The search pattern (phrase/sentence).
        
    Returns:
        dict: A dictionary containing:
            - 'matches': list of indices where pattern begins in text
            - 'comparisons': number of character-by-character comparisons made
            - 'time_taken': execution time in seconds
    """
    start_time = time.perf_counter()
    n = len(text)
    m = len(pattern)
    matches = []
    comparisons = 0
    
    if m == 0 or n == 0 or m > n:
        return {'matches': [], 'comparisons': 0, 'time_taken': time.perf_counter() - start_time}
    
    # Slide pattern over text one by one
    for i in range(n - m + 1):
        match = True
        for j in range(m):
            comparisons += 1
            if text[i + j] != pattern[j]:
                match = False
                break
        if match:
            matches.append(i)
            
    time_taken = time.perf_counter() - start_time
    return {
        'matches': matches,
        'comparisons': comparisons,
        'time_taken': time_taken
    }


def compute_lsp_table(pattern):
    """
    Helper for KMP: Computes the Longest Proper Prefix which is also a Suffix (LSP) table.
    Also known as the Pi table or Failure Function.
    
    Args:
        pattern (str): The search pattern.
        
    Returns:
        list: The LSP list of length len(pattern).
    """
    m = len(pattern)
    lsp = [0] * m
    length = 0  # length of the previous longest prefix suffix
    i = 1
    
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lsp[i] = length
            i += 1
        else:
            if length != 0:
                length = lsp[length - 1]
                # Note: We do not increment i here
            else:
                lsp[i] = 0
                i += 1
    return lsp


def kmp_search(text, pattern, return_lsp=False):
    """
    Knuth-Morris-Pratt (KMP) String Matching algorithm.
    Avoids backtracking over already matched characters using the LSP table.
    
    Args:
        text (str): The main document text.
        pattern (str): The search pattern.
        return_lsp (bool): If True, returns the calculated LSP table for analysis.
        
    Returns:
        dict: A dictionary containing:
            - 'matches': list of indices where pattern begins in text
            - 'comparisons': number of character-by-character comparisons made
            - 'time_taken': execution time in seconds
            - 'lsp_table': (optional) the computed failure function
    """
    start_time = time.perf_counter()
    n = len(text)
    m = len(pattern)
    matches = []
    comparisons = 0
    
    if m == 0 or n == 0 or m > n:
        res = {'matches': [], 'comparisons': 0, 'time_taken': time.perf_counter() - start_time}
        if return_lsp:
            res['lsp_table'] = []
        return res
        
    lsp = compute_lsp_table(pattern)
    
    i = 0  # index for text
    j = 0  # index for pattern
    
    while i < n:
        comparisons += 1
        if pattern[j] == text[i]:
            i += 1
            j += 1
            
        if j == m:
            matches.append(i - j)
            j = lsp[j - 1]
        elif i < n and pattern[j] != text[i]:
            # Mismatch after j matches
            if j != 0:
                j = lsp[j - 1]
            else:
                i += 1
                
    time_taken = time.perf_counter() - start_time
    result = {
        'matches': matches,
        'comparisons': comparisons,
        'time_taken': time_taken
    }
    if return_lsp:
        result['lsp_table'] = lsp
    return result


def rabin_karp_search(text, pattern, prime_mod=1000000007, base=256):
    """
    Rabin-Karp String Matching algorithm.
    Uses polynomial rolling hashes to compare pattern with text segments.
    
    Formula: Hash = (char[0]*d^(m-1) + char[1]*d^(m-2) + ... + char[m-1]*d^0) % prime_mod
    
    Args:
        text (str): The main document text.
        pattern (str): The search pattern.
        prime_mod (int): A large prime number for modulo operations (default: 10^9 + 7).
        base (int): The number of characters in the alphabet (default: 256).
        
    Returns:
        dict: A dictionary containing:
            - 'matches': list of indices where pattern begins in text
            - 'comparisons': number of character-by-character comparisons made
            - 'hash_collisions': number of times hashes matched but characters did not
            - 'time_taken': execution time in seconds
    """
    start_time = time.perf_counter()
    n = len(text)
    m = len(pattern)
    matches = []
    comparisons = 0
    collisions = 0
    
    if m == 0 or n == 0 or m > n:
        return {
            'matches': [],
            'comparisons': 0,
            'hash_collisions': 0,
            'time_taken': time.perf_counter() - start_time
        }
        
    # h = (base ^ (m-1)) % prime_mod. Used to remove leading digit hash
    h = 1
    for i in range(m - 1):
        h = (h * base) % prime_mod
        
    pattern_hash = 0
    text_window_hash = 0
    
    # Calculate the initial hash value of pattern and first window of text
    for i in range(m):
        pattern_hash = (base * pattern_hash + ord(pattern[i])) % prime_mod
        text_window_hash = (base * text_window_hash + ord(text[i])) % prime_mod
        
    # Slide the pattern over text one by one
    for i in range(n - m + 1):
        # Check if the hash values of current window of text and pattern match
        if pattern_hash == text_window_hash:
            # If the hash values match, verify characters one by one to avoid collisions
            match = True
            for j in range(m):
                comparisons += 1
                if text[i + j] != pattern[j]:
                    match = False
                    collisions += 1
                    break
            if match:
                matches.append(i)
                
        # Calculate hash value for next window of text:
        # Remove leading digit, add trailing digit
        if i < n - m:
            text_window_hash = (base * (text_window_hash - ord(text[i]) * h) + ord(text[i + m])) % prime_mod
            # We might get negative value of text_window_hash, converting it to positive
            if text_window_hash < 0:
                text_window_hash = text_window_hash + prime_mod
                
    time_taken = time.perf_counter() - start_time
    return {
        'matches': matches,
        'comparisons': comparisons,
        'hash_collisions': collisions,
        'time_taken': time_taken
    }


def string_hash(s, prime=2147483647):
    """
    A deterministic polynomial string hash function (djb2-like) to ensure
    consistent hashing across python sessions (since Python's hash() is randomized).
    """
    h = 5381
    for char in s:
        h = ((h << 5) + h) + ord(char)
        h = h & 0xffffffff
    return h % prime


def generate_minhash_signature(tokens, num_hashes=50, prime=2147483647):
    """
    Generates a MinHash signature vector for a set of word tokens.
    Uses K unique linear hash equations of form: h(x) = (a * x + b) % prime.
    
    Args:
        tokens (list): List of preprocessed word tokens.
        num_hashes (int): Signature vector size (default: 50).
        prime (int): Large prime number (default: 2^31 - 1).
        
    Returns:
        list: MinHash signature vector.
    """
    if not tokens:
        return [0] * num_hashes
        
    # Generate deterministic coefficients (a, b) for reproduciable hashes
    coefficients = []
    for i in range(num_hashes):
        a = (i * 97 + 37) % (prime - 1) + 1
        b = (i * 139 + 71) % prime
        coefficients.append((a, b))
        
    signature = []
    
    # Calculate minimum hash code for each linear function
    for a, b in coefficients:
        min_val = prime
        for token in tokens:
            token_val = string_hash(token, prime)
            hash_val = (a * token_val + b) % prime
            if hash_val < min_val:
                min_val = hash_val
        signature.append(min_val)
        
    return signature


def estimate_minhash_similarity(sig_a, sig_b):
    """
    Calculates similarity between two MinHash signature vectors.
    Evaluates the fraction of matching hashes in identical index positions.
    
    Args:
        sig_a (list): Signature list for set A.
        sig_b (list): Signature list for set B.
        
    Returns:
        float: Estimated similarity value (0.0 to 1.0).
    """
    if len(sig_a) != len(sig_b) or len(sig_a) == 0:
        return 0.0
        
    matching_positions = sum(1 for x, y in zip(sig_a, sig_b) if x == y)
    return matching_positions / len(sig_a)

