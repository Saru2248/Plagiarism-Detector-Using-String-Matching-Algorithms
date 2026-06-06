# Project Workbook: Plagiarism Detector Using String Matching

This workbook tracks the design decisions, phase-by-phase implementation details, and portfolio-building milestones for your DSA course project.

---

## 1. Tech Stack Options Comparison

Here are three tech stack variations. We selected **Option B (Python Modular CLI)** as the best choice for students seeking a robust, interview-ready portfolio piece.

| Feature | Option A: Easy | Option B: Intermediate (Selected) | Option C: Advanced |
| :--- | :--- | :--- | :--- |
| **Language** | Python | Python | C++ or Python + React |
| **Interface** | Single-script CLI | Modular CLI + Simulator + Reports | Web Dashboard Frontend + API Backend |
| **Algorithms** | Naive String Search | Naive + KMP + Rabin-Karp | KMP + Rabin-Karp + MinHash LSH |
| **Metrics** | Exact matches only | Exact matches + Jaccard + Containment | Exact + Jaccard + Vector Embeddings |
| **Reports** | Console printout | Plain TXT + Highlighted HTML Reports | Interactive charts + PDF export |
| **Why Option B is best:** | Too basic; does not show software engineering quality. | **Demonstrates modular design, algorithm comparisons, and rich outputs without UI boilerplates.** | Extremely high complexity; takes attention away from core DSA details. |

---

## 2. Phase-Wise Implementation Plan

### Phase 1: Setup & Environment
*   **What to do:** Initialize repository structure, set up `.gitignore`, configure Python virtual environment, and install dependencies (`colorama`).
*   **Why:** Ensures clean development hygiene and prevents tracking runtime artifacts (like cache folders) on Git.
*   **Expected Output:** Repo folder with `.gitignore` and `requirements.txt`.
*   **Beginner Mistake:** Committing `__pycache__` or virtual environment directories (`.venv/`) to GitHub.

### Phase 2: Document Input Creation
*   **What to do:** Create `documents/` folder and populate it with sample inputs: reference original files, heavily copied submissions, and original work submissions.
*   **Why:** Provides static benchmarks to test the accuracy of the matching engine.
*   **Expected Output:** Text files containing identical, slightly modified, and clean paragraphs.
*   **Beginner Mistake:** Using tiny documents (1 sentence) which makes it impossible to observe algorithmic performance differences.

### Phase 3: File Reading & Exception Handling
*   **What to do:** Write core I/O handlers in `src/preprocessing.py` to read file contents securely using UTF-8 encoding.
*   **Why:** Text files from students might contain non-ASCII characters that crash standard ASCII file readers.
*   **Expected Output:** Safe text retrieval functions that raise clear, friendly errors if a file doesn't exist.
*   **Beginner Mistake:** Hardcoding absolute file paths (e.g., `C:\Users\John\...`) that fail when cloned onto another computer.

### Phase 4: Text Preprocessing & Tokenization
*   **What to do:** Implement case-insensitive cleaning, punctuation removal, sentence splitting, and word tokenization.
*   **Why:** Exact string matching fails on minor differences like commas or capital letters.
*   **Expected Output:** Unified lowercase, punctuation-free strings for matching, alongside lists of individual words.
*   **Beginner Mistake:** Splitting sentences using only `.` which crashes on abbreviations like "e.g." or decimal numbers.

### Phase 5: Naive String Matching
*   **What to do:** Implement brute-force sliding-window pattern search and return matching indices.
*   **Why:** Serves as the control benchmark to highlight the efficiency of KMP and Rabin-Karp.
*   **Expected Output:** List of starting positions of the pattern in the text, along with a character comparison counter.
*   **Beginner Mistake:** Forgetting to return empty results if the pattern is longer than the text.

### Phase 6: KMP Algorithm Implementation
*   **What to do:** Build the LSP failure table calculator and KMP matcher.
*   **Why:** Achieves guaranteed linear-time $O(N + M)$ string search without backtracking the text pointer.
*   **Expected Output:** Correct LSP tables and exact matches in $O(N+M)$ comparisons.
*   **Beginner Mistake:** Writing an infinite loop when backtracking indices on mismatches.

### Phase 7: Rabin-Karp Algorithm
*   **What to do:** Implement the polynomial rolling hash, rolling math shifts, and collision checks.
*   **Why:** Introduces sliding-window hashing concepts and rolling $O(1)$ calculations.
*   **Expected Output:** Pattern search that evaluates matches primarily via integers, verifying characters only on collision.
*   **Beginner Mistake:** Not applying modulo arithmetic at each shift, causing arithmetic operations to overflow and slow down in Python.

### Phase 8: Similarity Metrics (Jaccard & Containment)
*   **What to do:** Compute set intersections, unions, Jaccard Similarity, and Containment Scores using word tokens.
*   **Why:** Catches paraphrasing and partial copies where students shuffle sentence orders.
*   **Expected Output:** Accurate percentage values of overall text overlap.
*   **Beginner Mistake:** Confusing Jaccard Similarity (Jaccard denominator includes the union of both texts) with Containment Score (Containment denominator is just the submission size).

### Phase 9: Report Generation (HTML & CLI)
*   **What to do:** Code the benchmark generator, plain text summary writer, and styled HTML dashboard generator with side-by-side text highlighting.
*   **Why:** Turns abstract command line output into visually stunning, interactive evidence that users can read instantly.
*   **Expected Output:** Beautiful HTML reports with CSS-styled plagiarism danger gauges.
*   **Beginner Mistake:** Using unicode characters (like checkmarks) that crash on Windows terminals due to cp1252 character maps.

### Phase 10: GitHub Documentation
*   **What to do:** Complete README.md, document install commands, save CLI terminal outputs, and upload screenshots of the dashboard.
*   **Why:** Formats your work into a high-visibility portfolio project ready for technical recruiters.
*   **Expected Output:** Premium, clean GitHub repository profile.

---

## 3. Day-Wise Git Commit Strategy

Use this day-wise guide to build your GitHub history with meaningful commit messages.

### Day 1: Repository Setup & Sample Data
*   **Goal:** Build folder structure, ignore filters, and sample text files.
*   **Git Command & Commits:**
    ```bash
    git init
    git add .gitignore requirements.txt documents/
    git commit -m "Feat: Initialize repo structure and populate test documents"
    ```
*   **Screenshot to Save:** Workspace folder structure in VS Code.

### Day 2: Text Preprocessing Pipeline
*   **Goal:** Code clean functions, sentence segmenter, and word tokenizers.
*   **Git Commit:**
    ```bash
    git add src/preprocessing.py
    git commit -m "Feat: Implement text preprocessing pipeline and UTF-8 safe I/O"
    ```

### Day 3: Naive & KMP Search Modules
*   **Goal:** Implement brute-force and Knuth-Morris-Pratt pattern search.
*   **Git Commit:**
    ```bash
    git add src/algorithms.py
    git commit -m "Feat: Implement Naive search and KMP algorithm with LSP table"
    ```
*   **Screenshot to Save:** KMP LSP array output test.

### Day 4: Rabin-Karp Rolling Hash
*   **Goal:** Implement rolling hash calculations and collision-safe verifications.
*   **Git Commit:**
    ```bash
    git add src/algorithms.py (updates)
    git commit -m "Feat: Implement Rabin-Karp polynomial rolling hash search"
    ```

### Day 5: Detection Orchestrator & Report Generator
*   **Goal:** Implement global similarity checks and output HTML dashboard generator.
*   **Git Commit:**
    ```bash
    git add src/detector.py src/utils.py main.py
    git commit -m "Feat: Add Jaccard, Containment scores, and HTML report generator"
    ```
*   **Screenshot to Save:** Styled HTML report open in browser.

### Day 6: Visual Simulator & README Documentation
*   **Goal:** Finalize interactive CLI simulator and write documentation.
*   **Git Commit:**
    ```bash
    git add README.md docs/
    git commit -m "Docs: Finalize README and add interview prep workbook"
    ```
*   **Screenshot to Save:** CLI menu displaying the step-by-step KMP simulation.
