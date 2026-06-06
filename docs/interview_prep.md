# Plagiarism Detector: Interview Preparation Guide

This document contains 10 key technical and behavioral interview questions, complete with deep technical answers, HR-aligned explanations, and design rationales to help you explain this project to recruiters and interviewers.

---

## 🙋‍♂️ Q1: Can you explain your project? (The Pitch)

### 👨‍💻 Technical Explanation:
"I built a modular **Plagiarism Detection System** in Python that evaluates document similarity at both the sentence level and the document level. 
*   For **sentence-level verbatim copy detection**, it tokenizes and cleans the text (removing case and punctuation) and checks each sentence of the submission against a reference text database using three string-matching algorithms: **Naive (brute-force)**, **Knuth-Morris-Pratt (KMP)**, and **Rabin-Karp (rolling hash)**.
*   For **document-level similarity**, it computes the **Jaccard Similarity** (measuring vocabulary intersection over union) and a **Containment Score** (intersection over submission size), which flags partial copy-pastes and paraphrasing.
*   The system includes an interactive CLI, a step-by-step visual simulator showing KMP prefix tables and Rabin-Karp roll calculations, and a reporting engine that compiles a benchmark comparison table and generates a CSS-styled interactive HTML report dashboard."

### 💼 HR-Friendly / Behavioral Explanation:
"This is an industry-inspired academic integrity tool similar to Turnitin or LeetCode’s cheat detection systems. I built it to solve a real-world problem: helping academic boards and EdTech platforms detect copying in submissions. From a engineering perspective, it demonstrates my understanding of text processing, performance benchmarking, modular software design, and the practical application of algorithms (like KMP and Rabin-Karp) over brute-force solutions."

---

## 🙋‍♂️ Q2: What is the KMP algorithm, and why is its time complexity $O(N + M)$?

### 👨‍💻 Technical Explanation:
The Knuth-Morris-Pratt (KMP) algorithm searches for occurrences of a pattern of length $M$ within a text of length $N$ in linear time. It achieves this by preprocessing the pattern to compute a **Longest Proper Prefix which is also a Suffix (LSP)** table. 
*   When a character mismatch occurs at index $j$ of the pattern, we know that the characters in the pattern from index $0$ to $j-1$ matched the text.
*   Instead of backtracking the text pointer $i$ (which the Naive algorithm does, resulting in $O(N \times M)$), KMP uses the LSP table to determine the next alignment index $j = \text{LSP}[j-1]$ and continues comparing from the current text position $i$.
*   Since the text pointer $i$ only moves forward (incremented in every cycle where there's a match or $j=0$), and the pattern pointer $j$ is shifted forward and backward without backtracking $i$, the total operations are bounded by $2N$ comparisons. Thus, the search phase takes $O(N)$ and preprocessing takes $O(M)$, leading to a total time complexity of $O(N + M)$ and space complexity of $O(M)$ for the LSP table.

### 💼 HR-Friendly / Behavioral Explanation:
"Standard text search can be incredibly slow if it checks every single letter from scratch after a mismatch. KMP is smart: it memorizes the structure of the search word beforehand. If it mismatches midway, it remembers what parts it already checked and slides the search window forward without re-reading the text. It's like reading a book and never having to scan back to the beginning of a line if you misread a word."

---

## 🙋‍♂️ Q3: How does the Rabin-Karp rolling hash work mathematically?

### 👨‍💻 Technical Explanation:
Rabin-Karp uses a **polynomial rolling hash** to search for a pattern in a text. The hash value of a string $S$ of length $M$ is calculated using a base $d$ (usually the size of the alphabet, e.g., 256) and a large prime modulus $q$:
$$\text{Hash}(S[0 \dots M-1]) = \left( S[0] \cdot d^{M-1} + S[1] \cdot d^{M-2} + \dots + S[M-1] \cdot d^0 \right) \bmod q$$

To slide the window to the next index in the text, we roll the hash in $O(1)$ constant time by:
1.  Subtracting the hash contribution of the leftmost (outgoing) character: $T[i] \cdot d^{M-1}$.
2.  Multiplying the remaining hash value by the base $d$ to shift all positions left.
3.  Adding the character value of the incoming character: $T[i+M]$.
4.  Applying modulo arithmetic to prevent overflow.

The rolling formula is:
$$\text{Hash}_{\text{new}} = \left( d \cdot \left( \text{Hash}_{\text{old}} - T[i] \cdot h \right) + T[i+M] \right) \bmod q$$
where $h = d^{M-1} \bmod q$.

### 💼 HR-Friendly / Behavioral Explanation:
"Instead of checking letters, Rabin-Karp turns sentences into numbers using math. It computes a numerical fingerprint (hash) of the search phrase. Then, it slides a fingerprint scanner across the text. When the scanner finds a fingerprint that matches the search phrase, it double-checks the characters to confirm. By doing math instead of character checks, it scans massive files in a fraction of the time."

---

## 🙋‍♂️ Q4: How do you handle hash collisions in Rabin-Karp?

### 👨‍💻 Technical Explanation:
A collision occurs when two different substrings result in the same hash value (i.e., $A \neq B$ but $\text{Hash}(A) = \text{Hash}(B)$). This happens because the hash space is constrained by the modulo prime $q$.
*   To handle this, Rabin-Karp is implemented as a **two-step verification**: if the hash of the text window matches the pattern hash, we perform a character-by-character validation of the substring.
*   If they match exactly, we record a pattern match. If they don't, we increment our collision counter and continue sliding.
*   To minimize collisions, we choose a very large prime modulus $q$ (e.g., $10^9 + 7$) and a suitable base $d$ (e.g., 256). In our implementation, we tracked these collisions explicitly during benchmarks, demonstrating that with a large prime, collisions are virtually zero ($0$ collisions in our test suite).

### 💼 HR-Friendly / Behavioral Explanation:
"Because math has limits, sometimes two different words can end up with the same code number. To make sure we don't flag original text as plagiarism, my program does a double-check. When the code numbers match, it checks the actual spelling letter-by-letter to guarantee it's a true match. This prevents false accusations of copying."

---

## 🙋‍♂️ Q5: Why did you combine Jaccard Similarity and Containment Score with exact string matching?

### 👨‍💻 Technical Explanation:
Exact string matching (KMP and Rabin-Karp) is excellent for finding verbatim copying. However, it fails if a student modifies a sentence slightly (e.g., adding a word, swapping word orders, or changing tense) because the exact sentence match is broken.
*   **Jaccard Similarity** ($|A \cap B| / |A \cup B|$) calculates the global overlap of unique words between the documents, ignoring structural sequence. This catches general thematic copying and heavy vocabulary sharing.
*   **Containment Score** ($|A \cap B| / |A|$) divides the word intersection by the size of the *submitted* document. If a student copies a small paragraph from a huge textbook, Jaccard Similarity will be low (due to the large denominator of the textbook size). The Containment Score, however, will be extremely high because most of the student's submission is contained in the textbook.

### 💼 HR-Friendly / Behavioral Explanation:
"If a student copies a sentence but changes one word or shuffles the order, standard search tools will miss it. By combining sentence search with mathematical word overlap checks (Jaccard and Containment), my detector catches plagiarized files even if the author tried to disguise it by rearranging words or tenses."

---

## 🙋‍♂️ Q6: What is the LSP/Pi table in KMP, and how is it constructed?

### 👨‍💻 Technical Explanation:
The Longest Proper Prefix which is also a Suffix (LSP) table is an array of size $M$ (length of pattern).
*   For the pattern substring $P[0 \dots i]$, $\text{LSP}[i]$ stores the length of the longest proper prefix of $P[0 \dots i]$ that is also a suffix of $P[0 \dots i]$.
*   **Construction Algorithm:** We use a two-pointer approach. We initialize a pointer `length = 0` (tracking prefix length) and an index `i = 1`. 
    - If $P[i] == P[\text{length}]$, we increment `length` and set $\text{LSP}[i] = \text{length}$, then move `i` forward.
    - If they mismatch and `length != 0`, we backtrack `length` to $\text{LSP}[\text{length}-1]$ (re-evaluating smaller prefix overlaps) without incrementing `i`.
    - If `length == 0`, we set $\text{LSP}[i] = 0$ and increment `i`.
*   This preprocessing step has $O(M)$ time complexity because the `length` pointer moves back and forth at most $M$ times.

### 💼 HR-Friendly / Behavioral Explanation:
"The LSP table is the brain of the KMP algorithm. It scans the search pattern and looks for repeating sub-patterns (like the 'abab' in 'ababcabab'). It maps out how words start and end similarly, allowing the search engine to skip forward during mismatches because it knows it has already seen a matching prefix."

---

## 🙋‍♂️ Q7: What are the performance trade-offs between Naive, KMP, and Rabin-Karp?

### 👨‍💻 Technical Explanation:
*   **Naive Search:** Very simple to write ($O(1)$ auxiliary space) but slow ($O(N \cdot M)$ worst case). Excellent for tiny inputs or cases where mismatches happen on the first character.
*   **KMP:** Guarantees linear time complexity $O(N + M)$ in all circumstances. It requires $O(M)$ auxiliary space. KMP is highly efficient for binary strings or texts with high character redundancy.
*   **Rabin-Karp:** Excellent for multi-pattern search (you can hash multiple patterns and scan the text once). It has $O(1)$ space complexity but can degrade to $O(N \cdot M)$ if the hash function is poor or if the modulus causes numerous collisions. In Python, Rabin-Karp has some interpreter overhead due to rolling arithmetic calculations.

### 💼 HR-Friendly / Behavioral Explanation:
"Naive is simple but slow. KMP is incredibly fast and dependable, though it uses a tiny bit of extra memory. Rabin-Karp is mathematically clever and uses almost no extra memory, but can be slightly slower in practice due to the complex arithmetic calculations. During my benchmarks, KMP had the fastest run time, while Rabin-Karp performed the fewest character comparisons."

---

## 🙋‍♂️ Q8: Explain rolling hash overflow and modulus issues in Python vs C++.

### 👨‍💻 Technical Explanation:
In static-typed languages like C++ or Java, integer types have fixed bit widths (e.g., 32-bit or 64-bit unsigned integers).
*   Multiplying and adding in rolling hash calculations can easily cause arithmetic **integer overflow**. Unsigned integer overflow automatically wraps around modulo $2^{32}$ or $2^{64}$, which acts as an implicit hash modulus.
*   In **Python**, integers have arbitrary precision (dynamic sizing). They automatically grow to accommodate large numbers without overflow.
*   However, if we don't apply an explicit modulo operation in Python, integers will grow extremely large (e.g., $256^{100}$), slowing down operations and exhausting memory.
*   Therefore, in Python, we must apply `% prime_modulus` at every step. Additionally, we must handle negative results during subtraction (e.g., `(hash - char * h) % mod`), converting them back to positive values by adding the modulus.

### 💼 HR-Friendly / Behavioral Explanation:
"In languages like C++, numbers have a strict limit and will reset to zero if they get too big. In Python, numbers can grow infinitely, which can slow down calculations. To keep our calculator fast and reliable across all programming languages, we use a math concept called 'modulo arithmetic' (clock math) to keep the numbers small and easy to process."

---

## 🙋‍♂️ Q9: How would you scale this system to scan billions of documents (like Google or Turnitin)?

### 👨‍💻 Technical Explanation:
To scale to billions of documents, running $O(N + M)$ comparison engines sequentially on raw text is impossible. We must transition to a distributed, index-based architecture:
1.  **MinHash & LSH (Locality-Sensitive Hashing):** Convert documents into signature vectors using Jaccard approximations. Group similar vectors together using LSH buckets, narrowing down comparison pairs from billions to a few dozen candidates.
2.  **Inverted Indexes (N-Grams):** Create an inverted index of document N-Grams (sequences of $N$ words). When a submission arrives, look up its N-Grams in the index to instantly fetch documents sharing identical phrases.
3.  **Distributed Processing (MapReduce/Spark):** Distribute candidate verification across a cluster of worker nodes.
4.  **Database Storage:** Store reference indexes in key-value stores or vector databases (e.g., Redis, Pinecone, or Elasticsearch) for sub-millisecond retrieval.

### 💼 HR-Friendly / Behavioral Explanation:
"To check billions of pages, we wouldn't compare the texts letter-by-letter. Instead, we would index them like the back of a textbook. We would break documents into tiny phrases and index which pages have them. When a new submission comes in, we look up its phrases in our index to find matches in milliseconds. We would also use cloud servers to divide the search workload."

---

## 🙋‍♂️ Q10: What was the most challenging engineering challenge you faced in this project?

### 👨‍💻 Technical Explanation:
"The biggest challenge was handling **false positives** during sentence-level matching. 
*   Initially, short sentences (like 'In this essay,', 'Thank you.', or 'References:') were flagged as plagiarized because they appeared in the reference text, artificially inflating the plagiarism score.
*   To resolve this, I introduced custom thresholds in the preprocessing and extraction pipelines: we filter out any sentences containing fewer than 5 characters or 2 words.
*   Another issue was handling Windows unicode terminal rendering, where unicode icons like checkmarks caused `UnicodeEncodeError` in cp1252 environments. I solved this by implementing strict ASCII fallback loggers, ensuring maximum cross-platform reliability without crashing."

### 💼 HR-Friendly / Behavioral Explanation:
"The trickiest part was preventing the program from flagging common phrases like 'Thank you' or 'In conclusion' as copied text. If I didn't filter these out, original submissions would get flagged as plagiarized. I adjusted the text scanner to ignore short phrases, which made the system much more accurate and realistic."
