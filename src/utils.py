import os
import time
from src.algorithms import compute_lsp_table

# ANSI escape codes for terminal colors
class Col:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Initialize colorama if available
try:
    import colorama
    colorama.init()
except ImportError:
    pass  # Fallback to standard ANSI sequences (supported in modern terminals)

def print_header(title):
    print(f"\n{Col.BOLD}{Col.HEADER}=== {title} ==={Col.ENDC}")

def print_success(msg):
    print(f"{Col.GREEN}[+] {msg}{Col.ENDC}")

def print_warning(msg):
    print(f"{Col.WARNING}[!] {msg}{Col.ENDC}")

def print_error(msg):
    print(f"{Col.FAIL}[x] {msg}{Col.ENDC}")

def print_info(msg):
    print(f"{Col.CYAN}[i] {msg}{Col.ENDC}")

def generate_text_report(results, orig_path, sub_path):
    """
    Generates a human-readable text report and returns it as a string.
    """
    report = []
    report.append("=" * 60)
    report.append("             PLAGIARISM DETECTION REPORT")
    report.append("=" * 60)
    report.append(f"Reference Document: {os.path.basename(orig_path)}")
    report.append(f"Submitted Document: {os.path.basename(sub_path)}")
    report.append(f"Algorithm Used:     {results['algorithm_used'].upper()}")
    report.append(f"Report Generated:   {time.strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("-" * 60)
    report.append("SIMILARITY METRICS:")
    report.append(f"  - Plagiarism Percentage (Verbatim Copy): {results['plagiarism_percentage']}%")
    report.append(f"  - Jaccard Similarity (Word Set Overlap): {results['jaccard_similarity']}%")
    report.append(f"  - Containment Score (Submitted in Ref):  {results['containment_score']}%")
    report.append(f"  - MinHash Jaccard Approximation:         {results.get('minhash_similarity', 0.0)}%")
    report.append("-" * 60)
    report.append("ALGORITHM PERFORMANCE STATISTICS:")
    report.append(f"  - Total Sentences Processed:             {results['total_submitted_sentences']}")
    report.append(f"  - Matched Plagiarized Sentences:         {results['matched_sentences_count']}")
    report.append(f"  - Character-by-Character Comparisons:     {results['total_comparisons']:,}")
    if results['algorithm_used'] == 'rabin-karp':
        report.append(f"  - Rabin-Karp Hash Collisions:            {results['total_collisions']}")
    report.append(f"  - Algorithm Execution Time:              {results['total_execution_time'] * 1000:.4f} ms")
    report.append("-" * 60)
    report.append("DETAILED MATCHES:")
    
    if not results['matched_sentences']:
        report.append("  No plagiarized segments detected.")
    else:
        for match in results['matched_sentences']:
            report.append(f"\n  [Sentence #{match['index'] + 1}] (Words: {match['word_count']})")
            report.append(f"  Submitted: \"{match['raw_text']}\"")
            report.append(f"  Matches in cleaned original text at indices: {match['matches_in_ref']}")
            
    report.append("\n" + "=" * 60)
    return "\n".join(report)

def generate_html_report(results, original_text, submitted_text, orig_path, sub_path, output_path):
    """
    Generates a stunning HTML report with side-by-side highlighting, Jaccard and containment scores, 
    and CSS gauge visualizations.
    """
    # Create highlighted submitted text
    # We will highlight sentences that were flagged as matches
    from src.preprocessing import split_into_sentences, clean_text
    
    sub_raw_sentences = split_into_sentences(submitted_text)
    highlighted_html_sentences = []
    
    matched_indices = {m['index'] for m in results['matched_sentences']}
    
    for idx, sentence in enumerate(sub_raw_sentences):
        if idx in matched_indices:
            # Highlight this sentence
            highlighted_html_sentences.append(f'<span class="plagiarized-text" title="Verbatim copy detected">{sentence}</span>')
        else:
            highlighted_html_sentences.append(f'<span>{sentence}</span>')
            
    highlighted_submitted_html = " ".join(highlighted_html_sentences)
    
    # Determine similarity status class
    percent = results['plagiarism_percentage']
    if percent < 15:
        status_class = "status-low"
        status_text = "Low Similarity (Original)"
    elif percent < 50:
        status_class = "status-medium"
        status_text = "Moderate Similarity (Paraphrased/Partial Copy)"
    else:
        status_class = "status-high"
        status_text = "High Plagiarism Danger"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plagiarism Detection Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {{
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent-green: #10b981;
            --accent-yellow: #f59e0b;
            --accent-red: #ef4444;
            --accent-blue: #3b82f6;
            --border-color: #334155;
        }}

        body {{
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}

        header {{
            background: linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%);
            padding: 30px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }}

        h1 {{
            margin: 0 0 10px 0;
            font-size: 2.2rem;
            font-weight: 700;
            background: linear-gradient(to right, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}

        .meta-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 15px;
            margin-top: 20px;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }}

        .meta-item strong {{
            color: var(--text-primary);
        }}

        /* Metrics Cards */
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}

        .metric-card {{
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s;
        }}
        
        .metric-card:hover {{
            transform: translateY(-2px);
        }}

        .metric-val {{
            font-size: 3rem;
            font-weight: 700;
            margin: 10px 0;
        }}

        .val-plag {{ color: var(--accent-red); }}
        .val-jaccard {{ color: var(--accent-blue); }}
        .val-contain {{ color: var(--accent-yellow); }}

        .metric-label {{
            font-size: 0.95rem;
            color: var(--text-secondary);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}

        .status-badge {{
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-top: 10px;
        }}

        .status-low {{
            background-color: rgba(16, 185, 129, 0.2);
            color: var(--accent-green);
            border: 1px solid var(--accent-green);
        }}

        .status-medium {{
            background-color: rgba(245, 158, 11, 0.2);
            color: var(--accent-yellow);
            border: 1px solid var(--accent-yellow);
        }}

        .status-high {{
            background-color: rgba(239, 68, 68, 0.2);
            color: var(--accent-red);
            border: 1px solid var(--accent-red);
        }}

        /* Document Viewer Details */
        .doc-section {{
            display: grid;
            grid-template-columns: 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }}

        .doc-card {{
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }}

        .doc-title {{
            font-size: 1.2rem;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 15px;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .doc-content {{
            height: 350px;
            overflow-y: auto;
            background-color: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            font-size: 0.95rem;
            white-space: pre-wrap;
        }}

        .plagiarized-text {{
            background-color: rgba(239, 68, 68, 0.25);
            border-bottom: 2px dashed var(--accent-red);
            padding: 2px 0;
            cursor: help;
        }}

        /* Performance Table */
        .stats-table-container {{
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 0.95rem;
        }}

        th, td {{
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
        }}

        th {{
            background-color: rgba(15, 23, 42, 0.4);
            color: var(--text-secondary);
            font-weight: 600;
        }}

        tr:hover td {{
            background-color: rgba(255, 255, 255, 0.02);
        }}

        footer {{
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Plagiarism Detector Analysis Report</h1>
            <div class="meta-grid">
                <div class="meta-item"><strong>Reference File:</strong> {os.path.basename(orig_path)}</div>
                <div class="meta-item"><strong>Submitted File:</strong> {os.path.basename(sub_path)}</div>
                <div class="meta-item"><strong>Algorithm:</strong> {results['algorithm_used'].upper()}</div>
                <div class="meta-item"><strong>Generated On:</strong> {time.strftime('%Y-%m-%d %H:%M:%S')}</div>
            </div>
        </header>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Plagiarism Percentage</div>
                <div class="metric-val val-plag">{results['plagiarism_percentage']}%</div>
                <span class="status-badge {status_class}">{status_text}</span>
            </div>
            <div class="metric-card">
                <div class="metric-label">Jaccard Word Similarity</div>
                <div class="metric-val val-jaccard">{results['jaccard_similarity']}%</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px;">Set-level word token overlap</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Containment Score</div>
                <div class="metric-val val-contain">{results['containment_score']}%</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px;">Submission size containment ratio</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">MinHash Jaccard Appx</div>
                <div class="metric-val" style="color: #c084fc;">{results.get('minhash_similarity', 0.0)}%</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px;">MinHash Jaccard (50 hashes)</div>
            </div>
        </div>

        <div class="doc-section">
            <div class="doc-card">
                <div class="doc-title">
                    <span>Submitted Document (Highlighted Copy)</span>
                    <span style="font-size: 0.8rem; font-weight: normal; color: var(--accent-red);">*Red segments represent verbatim copies found in reference text.</span>
                </div>
                <div class="doc-content">{highlighted_submitted_html}</div>
            </div>
        </div>

        <div class="stats-table-container">
            <div class="doc-title">Algorithm Performance Profile</div>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Algorithm Used</strong></td>
                        <td><span style="font-family: monospace; font-size: 1.1rem; color: var(--accent-blue);">{results['algorithm_used'].upper()}</span></td>
                        <td>The core matching algorithm selected for exact substring search.</td>
                    </tr>
                    <tr>
                        <td><strong>Sentences Compared</strong></td>
                        <td>{results['total_submitted_sentences']}</td>
                        <td>Total individual sentence blocks checked against reference database.</td>
                    </tr>
                    <tr>
                        <td><strong>Verbatim Matched Sentences</strong></td>
                        <td>{results['matched_sentences_count']}</td>
                        <td>Count of sentences found exactly inside reference database.</td>
                    </tr>
                    <tr>
                        <td><strong>Character Comparisons</strong></td>
                        <td>{results['total_comparisons']:,}</td>
                        <td>Total character checks performed by the sliding window.</td>
                    </tr>
                    {"<tr><td><strong>Rabin-Karp Collisions</strong></td><td>" + str(results['total_collisions']) + "</td><td>Times the hashes matched but characters differed.</td></tr>" if results['algorithm_used'] == 'rabin-karp' else ""}
                    <tr>
                        <td><strong>MinHash Signature Similarity</strong></td>
                        <td>{results.get('minhash_similarity', 0.0)}%</td>
                        <td>Estimated similarity index calculated via 50 deterministic hash functions.</td>
                    </tr>
                    <tr>
                        <td><strong>Execution Time</strong></td>
                        <td><strong style="color: var(--accent-green);">{results['total_execution_time'] * 1000:.4f} ms</strong></td>
                        <td>Time taken by matching algorithms (excluding loading and cleaning).</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <footer>
            Plagiarism Detector Using String Matching Algorithms &bull; Designed as a Data Structures & Algorithms Course Project
        </footer>
    </div>
</body>
</html>
"""
    # Write to target path
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)


def run_benchmark(original_text, submitted_text):
    """
    Runs a benchmark comparison of all three algorithms on the same input documents.
    """
    from src.preprocessing import preprocess_document
    from src.detector import run_plagiarism_detection
    
    # Preprocess once to be fair
    orig_data = preprocess_document(original_text)
    sub_data = preprocess_document(submitted_text)
    
    algorithms = ['naive', 'kmp', 'rabin-karp']
    benchmark_results = {}
    
    for algo in algorithms:
        res = run_plagiarism_detection(original_text, submitted_text, algorithm=algo)
        benchmark_results[algo] = {
            'time_ms': res['total_execution_time'] * 1000,
            'comparisons': res['total_comparisons'],
            'collisions': res['total_collisions'],
            'percentage': res['plagiarism_percentage']
        }
        
    return benchmark_results


def print_benchmark_table(benchmark_results):
    """
    Prints the benchmark comparison table in a neat console representation.
    """
    print_header("ALGORITHM BENCHMARK COMPARISON")
    
    headers = f"{Col.BOLD}{Col.CYAN}{'Algorithm':<15} | {'Comparisons':<15} | {'Collisions':<10} | {'Time (ms)':<12} | {'Similarity %':<12}{Col.ENDC}"
    separator = "-" * 75
    
    print(headers)
    print(separator)
    
    for algo, stats in benchmark_results.items():
        name = algo.upper()
        comparisons = f"{stats['comparisons']:,}"
        collisions = str(stats['collisions']) if algo == 'rabin-karp' else 'N/A'
        time_str = f"{stats['time_ms']:.4f}"
        pct = f"{stats['percentage']}%"
        
        # Color coding algorithm names
        if algo == 'naive':
            color = Col.FAIL
        elif algo == 'kmp':
            color = Col.GREEN
        else:
            color = Col.WARNING
            
        print(f"{color}{name:<15}{Col.ENDC} | {comparisons:<15} | {collisions:<10} | {time_str:<12} | {pct:<12}")
        
    print(separator)
    print_info("Naive (O(N*M)) does brute-force sliding shifts.")
    print_info("KMP (O(N+M)) utilizes the LSP failure array to skip matching iterations.")
    print_info("Rabin-Karp (O(N+M)) uses a polynomial rolling hash with fallback collision checks.")
