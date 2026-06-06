import os
import sys

# Ensure current directory is in PYTHONPATH to allow importing src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.preprocessing import read_file
from src.detector import run_plagiarism_detection, scan_reference_directory
from src.utils import (
    Col, print_header, print_success, print_warning, print_error, print_info,
    generate_text_report, generate_html_report, run_benchmark, print_benchmark_table
)
from src.algorithms import compute_lsp_table, kmp_search, rabin_karp_search

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def get_valid_file(prompt, default_path=None):
    """Prompts the user for a valid file path."""
    while True:
        if default_path:
            user_input = input(f"{prompt} (Press Enter for default: '{default_path}'): ").strip()
            if not user_input:
                return default_path
        else:
            user_input = input(prompt).strip()
            
        # Clean quotes if user drag-and-dropped the file
        user_input = user_input.replace('"', '').replace("'", "")
        
        if os.path.exists(user_input):
            return user_input
        else:
            print_error(f"File not found at '{user_input}'. Please try again.")

def run_detection_flow():
    """Runs the plagiarism detection process for two selected files."""
    print_header("SELECT DOCUMENTS TO COMPARE")
    
    # Defaults
    default_orig = os.path.join("documents", "original.txt")
    default_sub = os.path.join("documents", "submitted_plagiarized.txt")
    
    orig_path = get_valid_file("Enter path to the original/reference document", default_orig)
    sub_path = get_valid_file("Enter path to the student's submission document", default_sub)
    
    try:
        original_text = read_file(orig_path)
        submitted_text = read_file(sub_path)
    except Exception as e:
        print_error(f"Error reading files: {e}")
        return
        
    print_header("CHOOSE A STRING MATCHING ALGORITHM")
    print("1. Knuth-Morris-Pratt (KMP) - Recommended [O(N+M)]")
    print("2. Rabin-Karp (Rolling Hash) - [O(N+M) average]")
    print("3. Naive String Matching (Brute-force) - [O(N*M)]")
    
    choice = input("\nEnter choice (1-3): ").strip()
    algo = 'kmp'
    if choice == '2':
        algo = 'rabin-karp'
    elif choice == '3':
        algo = 'naive'
        
    print_info(f"Running detection using {algo.upper()}...")
    
    # Run detector
    results = run_plagiarism_detection(original_text, submitted_text, algorithm=algo)
    
    # Generate reports
    text_report = generate_text_report(results, orig_path, sub_path)
    
    # Display summary to console
    print_header("DETECTION SUMMARY")
    print(f"  - Plagiarism Score:      {Col.BOLD}{results['plagiarism_percentage']}%{Col.ENDC}")
    print(f"  - Jaccard Similarity:    {results['jaccard_similarity']}%")
    print(f"  - Containment Score:     {results['containment_score']}%")
    print(f"  - Sentences Checked:     {results['total_submitted_sentences']}")
    print(f"  - Plagiarized Sentences: {results['matched_sentences_count']}")
    print(f"  - Total comparisons:     {results['total_comparisons']:,}")
    print(f"  - Time Taken:            {results['total_execution_time'] * 1000:.4f} ms")
    
    # Action menu
    while True:
        print("\nWhat would you like to do next?")
        print("1. View full text report in console")
        print("2. Save reports to disk (TXT & HTML)")
        print("3. Compare all algorithms (Benchmark)")
        print("4. Return to main menu")
        
        next_choice = input("Enter choice (1-4): ").strip()
        if next_choice == '1':
            print("\n" + text_report)
        elif next_choice == '2':
            # Save files
            out_txt_dir = "outputs"
            out_html_dir = "reports"
            
            os.makedirs(out_txt_dir, exist_ok=True)
            os.makedirs(out_html_dir, exist_ok=True)
            
            txt_name = f"report_{os.path.basename(sub_path).split('.')[0]}.txt"
            html_name = f"report_{os.path.basename(sub_path).split('.')[0]}.html"
            
            txt_path = os.path.join(out_txt_dir, txt_name)
            html_path = os.path.join(out_html_dir, html_name)
            
            # Save TXT
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(text_report)
                
            # Save HTML
            generate_html_report(results, original_text, submitted_text, orig_path, sub_path, html_path)
            
            print_success(f"Text report saved to: {txt_path}")
            print_success(f"Styled HTML report saved to: {html_path}")
        elif next_choice == '3':
            benchmark_results = run_benchmark(original_text, submitted_text)
            print_benchmark_table(benchmark_results)
        elif next_choice == '4':
            break
        else:
            print_error("Invalid choice. Try again.")

def run_folder_scan_flow():
    """Compares a student submission file against all reference files in a folder."""
    clear_screen()
    print_header("SCAN SUBMISSION AGAINST REFERENCE DIRECTORY")
    
    # Set default documents
    default_sub = os.path.join("documents", "submitted_plagiarized.txt")
    sub_path = get_valid_file("Enter path to the student's submission document", default_sub)
    
    default_folder = "documents"
    doc_folder = input(f"Enter path to reference documents folder (Press Enter for default: '{default_folder}'): ").strip()
    if not doc_folder:
        doc_folder = default_folder
        
    if not os.path.exists(doc_folder):
        print_error(f"Directory '{doc_folder}' not found.")
        input("\nPress Enter to continue...")
        return
        
    try:
        submitted_text = read_file(sub_path)
    except Exception as e:
        print_error(f"Error reading submission file: {e}")
        input("\nPress Enter to continue...")
        return
        
    print_info(f"Scanning '{os.path.basename(sub_path)}' against database files in '{doc_folder}'...")
    
    try:
        reports = scan_reference_directory(submitted_text, doc_folder=doc_folder, algorithm='kmp')
        
        if not reports:
            print_warning("No reference text files (.txt) found in that directory.")
            input("\nPress Enter to continue...")
            return
            
        print_header("RANKED SIMILARITY MATCHES")
        # Print table header
        print(f"{'Rank':<5} | {'Reference File':<28} | {'Plagiarism %':<12} | {'Jaccard %':<9} | {'Containment %':<13} | {'MinHash %':<9} | {'Time (ms)':<9}")
        print("-" * 105)
        
        for idx, r in enumerate(reports):
            rank = idx + 1
            filename = r['filename']
            # Truncate filename if too long
            if len(filename) > 28:
                filename = filename[:25] + "..."
                
            plag_score = f"{r['plagiarism_percentage']:.2f}%"
            # Color plagiarism score based on severity
            if r['plagiarism_percentage'] >= 45.0:
                plag_score = f"{Col.FAIL}{plag_score:<12}{Col.ENDC}"
            elif r['plagiarism_percentage'] >= 15.0:
                plag_score = f"{Col.WARNING}{plag_score:<12}{Col.ENDC}"
            else:
                plag_score = f"{Col.GREEN}{plag_score:<12}{Col.ENDC}"
                
            print(f"{rank:<5} | {filename:<28} | {plag_score} | {r['jaccard_similarity']:<9.2f}% | {r['containment_score']:<13.2f}% | {r['minhash_similarity']:<9.2f}% | {r['total_execution_time_ms']:<9.2f}")
            
    except Exception as e:
        print_error(f"Scanning failed: {e}")
        
    input("\nPress Enter to return to main menu...")

def run_simulation_flow():
    """Performs visual simulation of KMP and Rabin-Karp algorithms on a small input."""
    clear_screen()
    print_header("DSA ALGORITHM VIRTUAL SIMULATION")
    print_info("This mode demonstrates the inner workings of KMP and Rabin-Karp step-by-step.")
    
    text = "ababcababdababcabab"
    pattern = "ababcabab"
    
    print(f"\nDefault text:    {Col.BOLD}{text}{Col.ENDC}")
    print(f"Default pattern: {Col.BOLD}{pattern}{Col.ENDC}")
    
    use_custom = input("\nWould you like to enter custom text/pattern? (y/n): ").strip().lower()
    if use_custom == 'y':
        text = input("Enter main text (lowercase, no spaces recommended): ").strip().lower()
        pattern = input("Enter pattern to search: ").strip().lower()
        if not text or not pattern:
            print_error("Invalid inputs. Reverting to default values.")
            text = "ababcababdababcabab"
            pattern = "ababcabab"
            
    print_header("CHOOSE SIMULATION")
    print("1. KMP (LSP Table & Search Index Progression)")
    print("2. Rabin-Karp (Polynomial Rolling Hash & Collisions)")
    
    sim_choice = input("\nEnter choice (1-2): ").strip()
    
    if sim_choice == '1':
        # KMP Simulation
        print_header("KMP VIRTUAL SIMULATION")
        print_info("Step 1: Computing the Longest Proper Prefix which is also a Suffix (LSP) Table.")
        
        lsp = compute_lsp_table(pattern)
        
        # Draw LSP table
        print("\nPattern Index vs LSP Value:")
        index_row = "Index:   "
        char_row =  "Char:    "
        lsp_row =   "LSP:     "
        for i, char in enumerate(pattern):
            index_row += f"{i:<4}"
            char_row += f"{char:<4}"
            lsp_row += f"{lsp[i]:<4}"
            
        print(index_row)
        print(char_row)
        print("-" * len(index_row))
        print(Col.GREEN + lsp_row + Col.ENDC)
        
        print("\nExplanation of LSP values:")
        print("At each index i, LSP[i] stores the length of the longest proper prefix of pattern[0...i]")
        print("which is also a suffix of pattern[0...i]. KMP uses this to skip re-comparing matched sections.")
        
        input("\nPress Enter to simulate the search process...")
        
        print_info("Step 2: Searching the pattern in the main text.")
        
        # Walk through the search
        n = len(text)
        m = len(pattern)
        i = 0
        j = 0
        step = 1
        
        while i < n:
            print(f"\n--- Step {step} ---")
            # Print text highlighting current index i
            text_vis = ""
            for idx, char in enumerate(text):
                if idx == i:
                    text_vis += f"{Col.FAIL}{Col.BOLD}{char}{Col.ENDC}"
                else:
                    text_vis += char
            print(f"Text:    {text_vis}  (i = {i})")
            
            # Print pattern shifted to match index i - j
            pattern_vis = " " * (i - j)
            for idx, char in enumerate(pattern):
                if idx == j:
                    pattern_vis += f"{Col.GREEN}{Col.BOLD}{char}{Col.ENDC}"
                else:
                    pattern_vis += char
            print(f"Pattern: {pattern_vis}  (j = {j})")
            
            step += 1
            
            if pattern[j] == text[i]:
                print(f"Match found! char '{pattern[j]}' == '{text[i]}'. Advance i and j.")
                i += 1
                j += 1
            else:
                print(f"Mismatch! char '{pattern[j]}' != '{text[i]}'.")
                if j != 0:
                    print(f"Shift pattern: Slide j from {j} to LSP[{j}-1] = {lsp[j-1]}")
                    j = lsp[j - 1]
                else:
                    print(f"Shift text: j is 0. Advance i to {i + 1}")
                    i += 1
                    
            if j == m:
                print(f"\n{Col.BOLD}{Col.GREEN}[+] PATTERN MATCHED AT INDEX {i - j}!{Col.ENDC}")
                j = lsp[j - 1]
                
            input("Press Enter for next step...")
            
        print_success("KMP search simulation complete!")
        
    elif sim_choice == '2':
        # Rabin-Karp Simulation
        print_header("RABIN-KARP ROLLING HASH SIMULATION")
        
        prime = 101 # Small prime for easy simulation representation
        base = 26   # Base 26 for alphabets
        
        print_info(f"Using simulation parameters: Prime Modulus = {prime}, Base = {base}")
        print("Hash formula: (c0*b^(m-1) + c1*b^(m-2) + ... + cm-1) % prime")
        
        # Calculate pattern hash
        m = len(pattern)
        n = len(text)
        
        pattern_hash = 0
        for char in pattern:
            pattern_hash = (base * pattern_hash + ord(char)) % prime
            
        print(f"\nPattern '{pattern}' hash value: {Col.BOLD}{Col.GREEN}{pattern_hash}{Col.ENDC}")
        
        input("\nPress Enter to begin sliding window hash computations...")
        
        # Initial text window hash
        window_hash = 0
        for i in range(m):
            window_hash = (base * window_hash + ord(text[i])) % prime
            
        # Slide
        h = 1
        for i in range(m - 1):
            h = (h * base) % prime
            
        for i in range(n - m + 1):
            window = text[i:i+m]
            print(f"\nWindow: '{window}' at Index {i}")
            print(f"  └─ Current Window Hash: {window_hash}")
            print(f"  └─ Pattern Hash:        {pattern_hash}")
            
            if window_hash == pattern_hash:
                print(f"  {Col.WARNING}[!] HASH MATCH! Performing character-by-character check...{Col.ENDC}")
                match = True
                for j in range(m):
                    if text[i+j] != pattern[j]:
                        match = False
                        print(f"    Collision! Mismatch at char index {j}: text '{text[i+j]}' != pattern '{pattern[j]}'")
                        break
                if match:
                    print(f"    {Col.GREEN}[+] EXACT MATCH confirmed at index {i}!{Col.ENDC}")
            else:
                print("  [x] Hashes do not match. Skipping character comparisons.")
                
            # Roll hash
            if i < n - m:
                next_char = text[i+m]
                prev_char = text[i]
                # Rolling hash math
                window_hash = (base * (window_hash - ord(prev_char) * h) + ord(next_char)) % prime
                if window_hash < 0:
                    window_hash += prime
                print(f"  └─ Rolling Hash to next index: Remove '{prev_char}', Add '{next_char}' -> New Hash: {window_hash}")
                
            input("\nPress Enter for next window...")
            
        print_success("Rabin-Karp simulation complete!")
        
    else:
        print_error("Invalid choice.")
        
    input("\nPress Enter to return to the main menu...")

def main_menu():
    while True:
        clear_screen()
        print(Col.BOLD + Col.BLUE + """
============================================================
       PLAGIARISM DETECTOR USING STRING MATCHING
============================================================
                 DSA COURSE PROJECT
============================================================
""" + Col.ENDC)
        print("1. Run Plagiarism Detection on Documents")
        print("2. Scan Folder of Reference Documents (Multi-File Check)")
        print("3. Run Algorithm Performance Benchmark")
        print("4. Run Step-by-Step Algorithm Virtual Simulation")
        print("5. Exit Project")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            run_detection_flow()
        elif choice == '2':
            run_folder_scan_flow()
        elif choice == '3':
            # Benchmark on default documents
            default_orig = os.path.join("documents", "original.txt")
            default_sub = os.path.join("documents", "submitted_plagiarized.txt")
            
            print_info("Benchmarking on default sample documents...")
            if not os.path.exists(default_orig) or not os.path.exists(default_sub):
                print_error("Sample documents not found. Run plagiarism detection (Option 1) to locate/select them first.")
                input("\nPress Enter to continue...")
                continue
                
            try:
                original_text = read_file(default_orig)
                submitted_text = read_file(default_sub)
                benchmark_results = run_benchmark(original_text, submitted_text)
                print_benchmark_table(benchmark_results)
            except Exception as e:
                print_error(f"Benchmark failed: {e}")
                
            input("\nPress Enter to return to main menu...")
        elif choice == '4':
            run_simulation_flow()
        elif choice == '5':
            print_success("Thank you for using the Plagiarism Detector. Goodbye!")
            break
        else:
            print_error("Invalid option. Please input 1-5.")
            time.sleep(1.5)

if __name__ == "__main__":
    main_menu()
