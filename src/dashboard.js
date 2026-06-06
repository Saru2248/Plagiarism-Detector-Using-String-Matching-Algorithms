/**
 * Plagiarism Detector - Interactive Dashboard Controller & Algorithm Engine
 * Core DSA Implementations in Vanilla JavaScript (ES6)
 * Supports Drag-and-Drop, Live Counters, Toast Notifications, and Match Index Sidebars
 */

// Global State
const state = {
    theme: 'dark',
    originalText: '',
    submittedText: '',
    simInterval: null,
    simState: null,
    referenceFiles: [],
    activeReports: []
};

// Default Sample Texts (Mirroring original.txt, submitted_plagiarized.txt, submitted_clean.txt)
const sampleTexts = {
    original: `Computer programming is the process of designing and building an executable computer program to accomplish a specific computing result.
The Knuth-Morris-Pratt algorithm is a string-matching algorithm that searches for occurrences of a word within a main text string.
It uses a precomputed table, often called the prefix function or failure function, to determine where to slide the pattern.
This avoids backtracking over characters that have already matched, which results in a linear time complexity of O(n + m).
Rabin-Karp is another powerful string-searching algorithm that uses hashing to find any one of a set of pattern strings.
It employs a rolling hash function to compute hash values of substrings quickly, achieving average O(n + m) time complexity.
However, in the worst-case scenario, its time complexity can degrade to O(n * m) due to hash collisions.
Academic integrity is a fundamental value of higher education, requiring students to submit original work and cite sources.
Plagiarism is defined as the practice of taking someone else's work or ideas and passing them off as one's own.
Detecting plagiarism involves comparing a submitted text against a database of reference documents to find similarities.
Using efficient string-matching algorithms makes it possible to scan thousands of pages in a few seconds.
Data structures and algorithms form the foundation of computer science, enabling developers to build scalable systems.
Proper software engineering practices require modular code, thorough testing, and clean documentation.
For a student's portfolio, a plagiarism detector project demonstrates strong command of algorithms, data structures, and text processing.
It is highly valued by hiring managers because it solves a real-world problem using fundamental computer science concepts.`,

    plagiarized: `In this assignment, we discuss computer programming and string matching.
Computer programming is the process of designing and building an executable computer program to accomplish a specific computing result.
We will study how to find matching patterns in text files.
The Knuth-Morris-Pratt algorithm is a string-matching algorithm that searches for occurrences of a word within a main text string.
It uses a precomputed table, often called the prefix function, to decide where to slide the pattern.
This avoids backtracking over characters that have already matched, which results in a linear time complexity of O(n + m).
Additionally, we looked at the Rabin-Karp algorithm which is another string-searching algorithm.
Rabin-Karp is another powerful string-searching algorithm that uses hashing to find any one of a set of pattern strings.
It employs a rolling hash function to compute hash values of substrings quickly, achieving average O(n + m) time complexity.
However, in the worst-case scenario, its time complexity can degrade to O(n * m) due to hash collisions.
In conclusion, plagiarism is defined as the practice of taking someone else's work or ideas and passing them off as one's own.
We should write our own code and avoid cheating in assignments.
Using efficient string-matching algorithms makes it possible to scan thousands of pages in a few seconds.
This project is highly valued by hiring managers because it solves a real-world problem using fundamental computer science concepts.
Thank you for reading my submission.`,

    clean: `This is a clean and original submission for the string matching assignment.
String matching is a key topic in computer science with many applications.
For instance, web search engines use pattern matching to find search terms in documents.
Similarly, bioinformaticians scan DNA sequences for specific genetic markers using these methods.
The naive approach compares the pattern with the text at every possible starting point.
Although simple to implement, the naive method is inefficient for long texts or patterns.
To solve this, advanced techniques like Knuth-Morris-Pratt and Rabin-Karp were invented.
These algorithms optimize the matching process by avoiding redundant comparisons.
KMP analyzes the pattern structure beforehand to identify repeat suffixes.
Rabin-Karp computes mathematical hashes of text windows to match multiple patterns at once.
Both approaches significantly reduce computational time compared to the basic search.
Writing original essays and coding assignments is vital for academic growth and honesty.
This project is an independent implementation of text similarity tools.
I have not copied any text from the reference materials provided in class.
I hope this work meets the grading criteria.`
};

// ==========================================
// 1. TOAST NOTIFICATIONS SERVICE
// ==========================================

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose icon based on toast type
    let icon = '💡';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// ==========================================
// 2. TEXT PREPROCESSING ENGINE
// ==========================================

function cleanText(text) {
    if (!text) return "";
    return text.toLowerCase()
               .replace(/[\r\n\t]+/g, ' ')
               .replace(/[^a-z0-9\s]/g, '')
               .replace(/\s+/g, ' ')
               .trim();
}

function splitIntoSentences(text) {
    if (!text) return [];
    return text.split(/(?<=[.!?])\s+/)
               .map(s => s.trim())
               .filter(s => s.length > 0);
}

function tokenizeWords(cleanedText) {
    if (!cleanedText) return [];
    return cleanedText.split(' ').filter(w => w.length > 0);
}

// ==========================================
// 3. CORE STRING MATCHING ALGORITHMS
// ==========================================

function naiveSearch(text, pattern) {
    const startTime = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    let comparisons = 0;
    
    if (m === 0 || n === 0 || m > n) {
        return { matches: [], comparisons: 0, timeTaken: performance.now() - startTime };
    }
    
    for (let i = 0; i <= n - m; i++) {
        let match = true;
        for (let j = 0; j < m; j++) {
            comparisons++;
            if (text[i + j] !== pattern[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            matches.push(i);
        }
    }
    
    return {
        matches,
        comparisons,
        timeTaken: performance.now() - startTime
    };
}

function computeLspTable(pattern) {
    const m = pattern.length;
    const lsp = new Array(m).fill(0);
    let length = 0;
    let i = 1;
    
    while (i < m) {
        if (pattern[i] === pattern[length]) {
            length++;
            lsp[i] = length;
            i++;
        } else {
            if (length !== 0) {
                length = lsp[length - 1];
            } else {
                lsp[i] = 0;
                i++;
            }
        }
    }
    return lsp;
}

function kmpSearch(text, pattern) {
    const startTime = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    let comparisons = 0;
    
    if (m === 0 || n === 0 || m > n) {
        return { matches: [], comparisons: 0, timeTaken: performance.now() - startTime };
    }
    
    const lsp = computeLspTable(pattern);
    let i = 0; // Text index
    let j = 0; // Pattern index
    
    while (i < n) {
        comparisons++;
        if (pattern[j] === text[i]) {
            i++;
            j++;
        }
        
        if (j === m) {
            matches.push(i - j);
            j = lsp[j - 1];
        } else if (i < n && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lsp[j - 1];
            } else {
                i++;
            }
        }
    }
    
    return {
        matches,
        comparisons,
        timeTaken: performance.now() - startTime
    };
}

function rabinKarpSearch(text, pattern, primeMod = 1000000007, base = 256) {
    const startTime = performance.now();
    const n = text.length;
    const m = pattern.length;
    const matches = [];
    let comparisons = 0;
    let collisions = 0;
    
    if (m === 0 || n === 0 || m > n) {
        return { matches: [], comparisons: 0, collisions: 0, timeTaken: performance.now() - startTime };
    }
    
    let h = 1;
    for (let i = 0; i < m - 1; i++) {
        h = (h * base) % primeMod;
    }
    
    let patternHash = 0;
    let textWindowHash = 0;
    
    for (let i = 0; i < m; i++) {
        patternHash = (base * patternHash + pattern.charCodeAt(i)) % primeMod;
        textWindowHash = (base * textWindowHash + text.charCodeAt(i)) % primeMod;
    }
    
    for (let i = 0; i <= n - m; i++) {
        if (patternHash === textWindowHash) {
            let match = true;
            for (let j = 0; j < m; j++) {
                comparisons++;
                if (text[i + j] !== pattern[j]) {
                    match = false;
                    collisions++;
                    break;
                }
            }
            if (match) {
                matches.push(i);
            }
        }
        
        if (i < n - m) {
            textWindowHash = (base * (textWindowHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % primeMod;
            if (textWindowHash < 0) {
                textWindowHash = textWindowHash + primeMod;
            }
        }
    }
    
    return {
        matches,
        comparisons,
        collisions,
        timeTaken: performance.now() - startTime
    };
}

// ==========================================
// 4. SIMILARITY COMPARISON ENGINE
// ==========================================

function computeJaccardSimilarity(tokensA, tokensB) {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    
    if (setA.size === 0 || setB.size === 0) return 0;
    
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    return intersection.size / union.size;
}

function computeContainmentScore(tokensSub, tokensRef) {
    const setSub = new Set(tokensSub);
    const setRef = new Set(tokensRef);
    
    if (setSub.size === 0) return 0;
    
    const intersection = new Set([...setSub].filter(x => setRef.has(x)));
    return intersection.size / setSub.size;
}

function detectPlagiarism(originalText, submittedText, algorithm = 'kmp', minWords = 2, minChars = 5) {
    const origCleanFull = cleanText(originalText);
    const subRawSentences = splitIntoSentences(submittedText);
    
    const origTokens = tokenizeWords(origCleanFull);
    const subCleanFull = cleanText(submittedText);
    const subTokens = tokenizeWords(subCleanFull);
    
    const matchedSentences = [];
    let plagiarizedWordCount = 0;
    const totalSubmittedWords = subTokens.length;
    
    let totalComparisons = 0;
    let totalCollisions = 0;
    let totalAlgoTime = 0;
    
    subRawSentences.forEach((rawSentence, idx) => {
        const cleanSentence = cleanText(rawSentence);
        const sentenceWords = cleanSentence.split(' ').filter(w => w.length > 0).length;
        
        if (cleanSentence.length < minChars || sentenceWords < minWords) {
            return;
        }
        
        let algoRes;
        if (algorithm === 'naive') {
            algoRes = naiveSearch(origCleanFull, cleanSentence);
        } else if (algorithm === 'kmp') {
            algoRes = kmpSearch(origCleanFull, cleanSentence);
        } else if (algorithm === 'rabin-karp') {
            algoRes = rabinKarpSearch(origCleanFull, cleanSentence);
            totalCollisions += algoRes.collisions;
        }
        
        totalComparisons += algoRes.comparisons;
        totalAlgoTime += algoRes.timeTaken;
        
        if (algoRes.matches.length > 0) {
            plagiarizedWordCount += sentenceWords;
            matchedSentences.push({
                index: idx,
                rawText: rawSentence,
                cleanedText: cleanSentence,
                matchesInRef: algoRes.matches,
                wordCount: sentenceWords
            });
        }
    });
    
    const jaccard = computeJaccardSimilarity(subTokens, origTokens);
    const containment = computeContainmentScore(subTokens, origTokens);
    
    // MinHash similarity calculation
    const sigOrig = generateMinHashSignatureJS(origTokens, 50);
    const sigSub = generateMinHashSignatureJS(subTokens, 50);
    const minhash = estimateMinHashSimilarityJS(sigOrig, sigSub);
    
    const plagiarismPercentage = totalSubmittedWords > 0 
        ? (plagiarizedWordCount / totalSubmittedWords) * 100 
        : 0;
        
    return {
        plagiarismPercentage: parseFloat(plagiarismPercentage.toFixed(2)),
        jaccardSimilarity: parseFloat((jaccard * 100).toFixed(2)),
        containmentScore: parseFloat((containment * 100).toFixed(2)),
        minhashSimilarity: parseFloat((minhash * 100).toFixed(2)),
        matchedSentences,
        totalSubmittedSentences: subRawSentences.length,
        totalComparisons,
        totalCollisions,
        totalExecutionTimeMs: totalAlgoTime
    };
}

// ==========================================
// 4.5 MINHASH SIMILARITY ALGORITHM
// ==========================================
function stringHashJS(s, prime = 2147483647) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) + s.charCodeAt(i);
        h = h & 0xffffffff;
    }
    return Math.abs(h) % prime;
}

function generateMinHashSignatureJS(tokens, numHashes = 50, prime = 2147483647) {
    if (!tokens || tokens.length === 0) {
        return new Array(numHashes).fill(0);
    }
    const coefficients = [];
    for (let i = 0; i < numHashes; i++) {
        const a = (i * 97 + 37) % (prime - 1) + 1;
        const b = (i * 139 + 71) % prime;
        coefficients.push({ a, b });
    }
    const signature = [];
    for (let k = 0; k < numHashes; k++) {
        const { a, b } = coefficients[k];
        let minVal = prime;
        for (let i = 0; i < tokens.length; i++) {
            const tokenVal = stringHashJS(tokens[i], prime);
            const hashVal = (a * tokenVal + b) % prime;
            if (hashVal < minVal) {
                minVal = hashVal;
            }
        }
        signature.push(minVal);
    }
    return signature;
}

function estimateMinHashSimilarityJS(sigA, sigB) {
    if (sigA.length !== sigB.length || sigA.length === 0) return 0;
    let matches = 0;
    for (let i = 0; i < sigA.length; i++) {
        if (sigA[i] === sigB[i]) matches++;
    }
    return matches / sigA.length;
}

// ==========================================
// 5. UI CONTROLLER & EVENT HANDLERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTabs();
    initSampleInjectors();
    initFileInputs();
    initDragAndDrop();
    initLiveCounters();
    
    document.getElementById('analyze-btn').addEventListener('click', handleAnalysis);
    document.getElementById('start-sim-btn').addEventListener('click', handleSimulationStart);
    document.getElementById('stop-sim-btn').addEventListener('click', handleSimulationStop);
    
    // New feature event handlers
    document.getElementById('export-pdf-btn').addEventListener('click', exportPDFReport);
    document.getElementById('export-json-btn').addEventListener('click', exportJSONData);
    document.getElementById('ngram-refresh-btn').addEventListener('click', renderNGramFingerprint);
    document.getElementById('reset-flashcards-btn').addEventListener('click', resetFlashcards);
    
    // Frequency tab buttons
    document.querySelectorAll('.freq-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.freq-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFrequencyChart(btn.dataset.freq);
        });
    });
    
    // Initialize interview flashcards on page load (static content)
    initFlashcards();
    
    // Pre-populate fields
    document.getElementById('original-input').value = sampleTexts.original;
    document.getElementById('submitted-input').value = sampleTexts.plagiarized;
    updateCounterDisplay('original-input', 'orig-words-lbl', 'orig-chars-lbl', 'orig-sents-lbl');
    updateCounterDisplay('submitted-input', 'sub-words-lbl', 'sub-chars-lbl', 'sub-sents-lbl');
    
    showToast("Dashboard loaded! 5 tabs available — Compare, Analytics, Simulator, Interview Prep, and DSA Notes.", "success");
});


/* Theme control */
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        state.theme = nextTheme;
        document.documentElement.setAttribute('data-theme', nextTheme);
        toggleBtn.innerHTML = nextTheme === 'dark' 
            ? `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`
            : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
        showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, "success");
    });
}

/* Tabs */
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
            
            if (target === 'sim-panel') {
                resetSimulationView();
            }
        });
    });
}

/* Drag and Drop uploads */
function initDragAndDrop() {
    const dragZones = document.querySelectorAll('.drag-zone');
    
    dragZones.forEach(zone => {
        const textarea = zone.querySelector('textarea');
        const fileInputId = textarea.id === 'original-input' ? 'original-file' : 'submitted-file';
        
        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
            }, false);
        });
        
        zone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            
            if (file && file.type === "text/plain") {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    textarea.value = evt.target.result;
                    // Trigger counters update
                    textarea.dispatchEvent(new Event('input'));
                    showToast(`File "${file.name}" uploaded successfully via drag-and-drop.`, "success");
                };
                reader.readAsText(file);
            } else {
                showToast("Invalid file type. Only plain text (.txt) files are supported.", "danger");
            }
        }, false);
    });
}

/* Live Character & Word Counters */
function initLiveCounters() {
    const origArea = document.getElementById('original-input');
    const subArea = document.getElementById('submitted-input');
    
    origArea.addEventListener('input', () => {
        updateCounterDisplay('original-input', 'orig-words-lbl', 'orig-chars-lbl', 'orig-sents-lbl');
    });
    
    subArea.addEventListener('input', () => {
        updateCounterDisplay('submitted-input', 'sub-words-lbl', 'sub-chars-lbl', 'sub-sents-lbl');
    });
}

function updateCounterDisplay(textareaId, wordsId, charsId, sentsId) {
    const text = document.getElementById(textareaId).value;
    const chars = text.length;
    
    const clean = cleanText(text);
    const words = tokenizeWords(clean).length;
    const sents = splitIntoSentences(text).length;
    
    document.getElementById(wordsId).innerText = words.toLocaleString();
    document.getElementById(charsId).innerText = chars.toLocaleString();
    document.getElementById(sentsId).innerText = sents.toLocaleString();
}

/* File Upload buttons */
function initFileInputs() {
    const origFile = document.getElementById('original-file');
    const subFile = document.getElementById('submitted-file');
    
    origFile.addEventListener('change', (e) => {
        handleMultipleReferenceFiles(e);
    });
    
    subFile.addEventListener('change', (e) => {
        handleFileRead(e, 'submitted-input', () => {
            updateCounterDisplay('submitted-input', 'sub-words-lbl', 'sub-chars-lbl', 'sub-sents-lbl');
        });
    });
}

function handleMultipleReferenceFiles(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    state.referenceFiles = [];
    let filesLoaded = 0;
    
    const origInput = document.getElementById('original-input');
    const origBtn = document.getElementById('original-file-btn');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(e) {
            state.referenceFiles.push({
                name: file.name,
                content: e.target.result
            });
            filesLoaded++;
            if (filesLoaded === files.length) {
                // If it's just one file, populate the textarea directly
                if (files.length === 1) {
                    origInput.value = state.referenceFiles[0].content;
                    origInput.dispatchEvent(new Event('input'));
                    origBtn.innerText = `Choose File(s)...`;
                } else {
                    // If multiple files, write the first one's content to the textarea but track the count
                    origInput.value = state.referenceFiles[0].content;
                    origInput.dispatchEvent(new Event('input'));
                    origBtn.innerText = `${files.length} Files Selected`;
                }
                showToast(`Loaded ${files.length} reference file(s) successfully.`, "success");
            }
        };
        reader.readAsText(file);
    }
}

function handleFileRead(event, targetTextareaId, callback) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById(targetTextareaId).value = e.target.result;
        showToast(`Document "${file.name}" loaded successfully.`, "success");
        if (callback) callback();
    };
    reader.readAsText(file);
}

/* Sample text injections */
function initSampleInjectors() {
    document.getElementById('load-orig-sample').addEventListener('click', () => {
        document.getElementById('original-input').value = sampleTexts.original;
        updateCounterDisplay('original-input', 'orig-words-lbl', 'orig-chars-lbl', 'orig-sents-lbl');
        showToast("Reference sample loaded.", "success");
    });
    
    document.getElementById('load-sub-plag').addEventListener('click', () => {
        document.getElementById('submitted-input').value = sampleTexts.plagiarized;
        updateCounterDisplay('submitted-input', 'sub-words-lbl', 'sub-chars-lbl', 'sub-sents-lbl');
        showToast("Plagiarized submission sample loaded.", "warning");
    });
    
    document.getElementById('load-sub-clean').addEventListener('click', () => {
        document.getElementById('submitted-input').value = sampleTexts.clean;
        updateCounterDisplay('submitted-input', 'sub-words-lbl', 'sub-chars-lbl', 'sub-sents-lbl');
        showToast("Clean submission sample loaded.", "success");
    });
}

// ==========================================
// 6. ANALYSIS & REPORT GENERATION
// ==========================================

function handleAnalysis() {
    const origVal = document.getElementById('original-input').value;
    const subVal = document.getElementById('submitted-input').value;
    const algoSelected = document.getElementById('algo-select').value;
    
    if (!origVal.trim() || !subVal.trim()) {
        showToast("Error: Both text fields must contain content before running analysis.", "danger");
        return;
    }
    
    const minWords = parseInt(document.getElementById('param-words').value) || 2;
    const minChars = parseInt(document.getElementById('param-chars').value) || 5;
    
    showToast("Analyzing string matching datasets...", "success");
    
    // Check if we have multiple files loaded in state
    if (state.referenceFiles && state.referenceFiles.length > 1) {
        // Multi-file check!
        const reports = [];
        state.referenceFiles.forEach(refFile => {
            const results = detectPlagiarism(refFile.content, subVal, algoSelected, minWords, minChars);
            reports.push({
                name: refFile.name,
                content: refFile.content,
                results: results
            });
        });
        
        // Sort by plagiarism score descending, then by containment score
        reports.sort((a, b) => {
            if (b.results.plagiarismPercentage !== a.results.plagiarismPercentage) {
                return b.results.plagiarismPercentage - a.results.plagiarismPercentage;
            }
            return b.results.containmentScore - a.results.containmentScore;
        });
        
        // Show the ranked card
        const rankedCard = document.getElementById('ranked-sources-card');
        const rankedList = document.getElementById('ranked-sources-list');
        rankedCard.style.display = 'block';
        
        // Render sources list
        rankedList.innerHTML = reports.map((rep, idx) => {
            let scoreColor = 'text-success';
            if (rep.results.plagiarismPercentage >= 45) scoreColor = 'text-danger';
            else if (rep.results.plagiarismPercentage >= 15) scoreColor = 'text-warning';
            
            return `
                <div class="source-match-card ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                    <div class="source-match-name" title="${rep.name}">${rep.name}</div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <span class="source-match-score ${scoreColor}">${rep.results.plagiarismPercentage}% Match</span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">MinHash: ${rep.results.minhashSimilarity}%</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Store reports in state to reload on click
        state.activeReports = reports;
        
        // Set up click handlers on source cards
        rankedList.querySelectorAll('.source-match-card').forEach(card => {
            card.addEventListener('click', () => {
                rankedList.querySelectorAll('.source-match-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                const idx = parseInt(card.dataset.idx);
                const activeRep = state.activeReports[idx];
                
                // Load this file's contents into reference textarea
                document.getElementById('original-input').value = activeRep.content;
                updateCounterDisplay('original-input', 'orig-words-lbl', 'orig-chars-lbl', 'orig-sents-lbl');
                
                // Display results for this source
                displaySingleReport(activeRep.results, activeRep.content, subVal);
                showToast(`Switched active reference viewer to "${activeRep.name}"`, "success");
            });
        });
        
        // Display results for the top matched report by default
        displaySingleReport(reports[0].results, reports[0].content, subVal);
        showToast(`Multi-file scan finished. Ranked match results populated!`, "success");
    } else {
        // Regular single file check
        document.getElementById('ranked-sources-card').style.display = 'none';
        const results = detectPlagiarism(origVal, subVal, algoSelected, minWords, minChars);
        displaySingleReport(results, origVal, subVal);
    }
    
    // Reveal results panel
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

function displaySingleReport(results, originalText, submittedText) {
    // 1. Progress Gauges & Cards
    updateProgressGauge(results.plagiarismPercentage);
    updatePlagiarismInterpretation(results.plagiarismPercentage);
    
    document.getElementById('jaccard-val').innerText = results.jaccardSimilarity + '%';
    document.getElementById('containment-val').innerText = results.containmentScore + '%';
    document.getElementById('minhash-val').innerText = (results.minhashSimilarity !== undefined ? results.minhashSimilarity : '0') + '%';
    
    document.getElementById('stat-checked').innerText = results.totalSubmittedSentences;
    document.getElementById('stat-flagged').innerText = results.matchedSentences.length;
    
    // 2. Highlighting split viewer
    renderHighlightedPanes(originalText, submittedText, results.matchedSentences);
    
    // 3. Compile match index sidebar list
    renderMatchSidebar(results.matchedSentences);
    
    // 4. Compile benchmark calculations
    renderBenchmarkStats(originalText, submittedText, results);
    
    // 5. NEW: Deep Analytics Features
    // Store data globally so analytics tab can reference it
    state.lastOriginalText = originalText;
    state.lastSubmittedText = submittedText;
    state.lastResults = results;
    
    renderRiskTimeline(submittedText, results.matchedSentences);
    renderFrequencyChart('original'); // Default view
    renderNGramFingerprint();
    
    showToast(`Analysis complete! ${results.matchedSentences.length} matches found. Check Deep Analytics tab for details.`, 'success');
}

function updateProgressGauge(percent) {
    const circle = document.querySelector('.circle-progress');
    const text = document.querySelector('.circle-text');
    
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    text.innerText = `${percent}%`;
    
    circle.className.baseVal = "circle-progress"; // reset
    text.className.baseVal = "circle-text"; // reset
    
    if (percent < 15) {
        circle.classList.add('circle-progress-success');
        text.classList.add('text-success');
    } else if (percent < 50) {
        circle.classList.add('circle-progress-warning');
        text.classList.add('text-warning');
    } else {
        text.classList.add('text-danger');
    }
}

function updatePlagiarismInterpretation(percent) {
    const box = document.getElementById('score-interpretation');
    
    box.className = "interpretation-box"; // reset
    
    if (percent < 15) {
        box.classList.add('safe');
        box.innerHTML = `
            <span class="interpretation-icon">✅</span>
            <div>
                <strong>Safe content profile matches</strong>: Plagiarism similarity score is low (${percent}%). The submission represents original content or contains properly formatted quotations and short common phrases.
            </div>
        `;
    } else if (percent < 45) {
        box.classList.add('caution');
        box.innerHTML = `
            <span class="interpretation-icon">⚠️</span>
            <div>
                <strong>Moderate similarity matches found</strong>: Similarity index is elevated (${percent}%). Review highlighted sentence regions to verify if citations, quotations, or rephrasing adjustments are necessary.
            </div>
        `;
    } else {
        box.classList.add('danger');
        box.innerHTML = `
            <span class="interpretation-icon">🚨</span>
            <div>
                <strong>High similarity indicators flagged</strong>: High plagiarism risk detected (${percent}%). Large sections of the submission are verbatim copies of the reference source. Remediation is required.
            </div>
        `;
    }
}

function renderHighlightedPanes(originalText, submittedText, matchedSentences) {
    const origPane = document.getElementById('highlighted-original');
    const subPane = document.getElementById('highlighted-submitted');
    
    const origCleanFull = cleanText(originalText);
    
    const subRawSentences = splitIntoSentences(submittedText);
    const matchedIndices = new Set(matchedSentences.map(m => m.index));
    
    const subHTML = subRawSentences.map((sentence, idx) => {
        if (matchedIndices.has(idx)) {
            return `<span class="highlight-plagiarized" data-match-idx="${idx}" id="sub-sentence-${idx}" title="Click to scroll to reference source">${sentence}</span>`;
        }
        return `<span>${sentence}</span>`;
    }).join(' ');
    
    subPane.innerHTML = subHTML;
    
    const origRawSentences = splitIntoSentences(originalText);
    const cleanedMatches = new Set(matchedSentences.map(m => m.cleanedText));
    
    const origHTML = origRawSentences.map((sentence, idx) => {
        const cleaned = cleanText(sentence);
        if (cleanedMatches.has(cleaned)) {
            return `<span class="highlight-source-match" data-cleaned-sentence="${cleaned}" id="orig-sentence-${idx}">${sentence}</span>`;
        }
        return `<span>${sentence}</span>`;
    }).join(' ');
    
    origPane.innerHTML = origHTML;
    
    // Add Click listener to sync scroll and highlight matching source
    subPane.querySelectorAll('.highlight-plagiarized').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.matchIdx);
            scrollToMatch(idx, matchedSentences, origPane, subPane);
        });
    });
}

function renderMatchSidebar(matchedSentences) {
    const listContainer = document.getElementById('match-sidebar-list');
    
    if (matchedSentences.length === 0) {
        listContainer.innerHTML = `
            <div style="color: var(--text-secondary); text-align: center; margin-top: 100px; font-size: 0.8rem;">
                No matches flagged.<br>All clean!
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = matchedSentences.map((match, i) => `
        <div class="match-item" data-match-idx="${match.index}">
            <div class="match-item-meta">
                <span>Match #${i + 1}</span>
                <span>${match.wordCount} words</span>
            </div>
            <div class="match-item-text">"${match.rawText}"</div>
        </div>
    `).join('');
    
    listContainer.querySelectorAll('.match-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.matchIdx);
            const origPane = document.getElementById('highlighted-original');
            const subPane = document.getElementById('highlighted-submitted');
            scrollToMatch(idx, matchedSentences, origPane, subPane);
        });
    });
}

function scrollToMatch(idx, matchedSentences, origPane, subPane) {
    const match = matchedSentences.find(m => m.index === idx);
    if (!match) return;
    
    // Scroll submission pane to active sentence
    const subSentenceEl = document.getElementById(`sub-sentence-${idx}`);
    if (subSentenceEl) {
        // Toggle active border styling
        subPane.querySelectorAll('.highlight-plagiarized').forEach(s => s.classList.remove('active'));
        subSentenceEl.classList.add('active');
        subSentenceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Scroll reference pane to matching cleaned sentence
    const targetCleaned = match.cleanedText;
    const sourceEl = origPane.querySelector(`[data-cleaned-sentence="${targetCleaned}"]`);
    
    if (sourceEl) {
        sourceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sourceEl.classList.add('flash');
        setTimeout(() => sourceEl.classList.remove('flash'), 1200);
        showToast(`Navigated to reference matches for Sentence #${idx + 1}`, "success");
    }
}

function renderBenchmarkStats(origVal, subVal, primaryResults) {
    const naiveRes = detectPlagiarism(origVal, subVal, 'naive');
    const kmpRes = detectPlagiarism(origVal, subVal, 'kmp');
    const rkRes = detectPlagiarism(origVal, subVal, 'rabin-karp');
    
    document.getElementById('bench-naive-comp').innerText = naiveRes.totalComparisons.toLocaleString();
    document.getElementById('bench-naive-coll').innerText = 'N/A';
    document.getElementById('bench-naive-time').innerText = naiveRes.totalExecutionTimeMs.toFixed(4) + ' ms';
    
    document.getElementById('bench-kmp-comp').innerText = kmpRes.totalComparisons.toLocaleString();
    document.getElementById('bench-kmp-coll').innerText = 'N/A';
    document.getElementById('bench-kmp-time').innerText = kmpRes.totalExecutionTimeMs.toFixed(4) + ' ms';
    
    document.getElementById('bench-rk-comp').innerText = rkRes.totalComparisons.toLocaleString();
    document.getElementById('bench-rk-coll').innerText = rkRes.totalCollisions;
    document.getElementById('bench-rk-time').innerText = rkRes.totalExecutionTimeMs.toFixed(4) + ' ms';
    
    // Fill CSS charts
    const maxComp = Math.max(naiveRes.totalComparisons, kmpRes.totalComparisons, rkRes.totalComparisons, 1);
    const maxTime = Math.max(naiveRes.totalExecutionTimeMs, kmpRes.totalExecutionTimeMs, rkRes.totalExecutionTimeMs, 0.0001);
    
    document.getElementById('fill-naive-comp').style.width = `${(naiveRes.totalComparisons / maxComp) * 100}%`;
    document.getElementById('val-naive-comp').innerText = naiveRes.totalComparisons.toLocaleString();
    
    document.getElementById('fill-kmp-comp').style.width = `${(kmpRes.totalComparisons / maxComp) * 100}%`;
    document.getElementById('val-kmp-comp').innerText = kmpRes.totalComparisons.toLocaleString();
    
    document.getElementById('fill-rk-comp').style.width = `${(rkRes.totalComparisons / maxComp) * 100}%`;
    document.getElementById('val-rk-comp').innerText = rkRes.totalComparisons.toLocaleString();
    
    document.getElementById('fill-naive-time').style.width = `${(naiveRes.totalExecutionTimeMs / maxTime) * 100}%`;
    document.getElementById('val-naive-time').innerText = naiveRes.totalExecutionTimeMs.toFixed(4) + ' ms';
    
    document.getElementById('fill-kmp-time').style.width = `${(kmpRes.totalExecutionTimeMs / maxTime) * 100}%`;
    document.getElementById('val-kmp-time').innerText = kmpRes.totalExecutionTimeMs.toFixed(4) + ' ms';
    
    document.getElementById('fill-rk-time').style.width = `${(rkRes.totalExecutionTimeMs / maxTime) * 100}%`;
    document.getElementById('val-rk-time').innerText = rkRes.totalExecutionTimeMs.toFixed(4) + ' ms';
}

// ==========================================
// 7. ALGORITHM VIRTUAL SIMULATOR
// ==========================================

function resetSimulationView() {
    handleSimulationStop();
    document.getElementById('sim-display').innerHTML = `<p style="color: var(--text-secondary);">Click "Start Simulation" to initialize visual execution logs.</p>`;
    document.getElementById('sim-logs-box').innerHTML = `<div class="sim-log-entry">Waiting for simulation to start...</div>`;
}

function handleSimulationStop() {
    if (state.simInterval) {
        clearInterval(state.simInterval);
        state.simInterval = null;
    }
    document.getElementById('start-sim-btn').disabled = false;
    document.getElementById('stop-sim-btn').disabled = true;
}

function handleSimulationStart() {
    resetSimulationView();
    
    const textInput = document.getElementById('sim-text-input').value.trim().toLowerCase();
    const patInput = document.getElementById('sim-pat-input').value.trim().toLowerCase();
    const algo = document.getElementById('sim-algo-select').value;
    
    if (!textInput || !patInput) {
        showToast("Error: Enter both pattern and search target text.", "danger");
        return;
    }
    
    if (patInput.length > textInput.length) {
        showToast("Error: Pattern length cannot exceed target text length.", "danger");
        return;
    }
    
    document.getElementById('start-sim-btn').disabled = true;
    document.getElementById('stop-sim-btn').disabled = false;
    
    showToast(`Starting step-by-step ${algo.toUpperCase()} simulator...`, "success");
    
    const logsBox = document.getElementById('sim-logs-box');
    logsBox.innerHTML = `<div class="sim-log-entry sim-log-warning">[Setup] Initializing ${algo.toUpperCase()} Simulation...</div>`;
    
    if (algo === 'kmp') {
        runKMPSimulation(textInput, patInput);
    } else {
        runRabinKarpSimulation(textInput, patInput);
    }
}

function runKMPSimulation(text, pattern) {
    const logsBox = document.getElementById('sim-logs-box');
    const display = document.getElementById('sim-display');
    
    logSimMessage("Step 1: Calculating KMP Prefix Function Table (LSP Array)...", "warning");
    const lsp = computeLspTable(pattern);
    
    let tableHTML = `
        <div class="sim-visualization-box">
            <h4 style="margin-bottom: 10px;">Computed LSP Table:</h4>
            <div class="pattern-table-container">
                <table class="pat-table">
                    <tr class="pat-lbl-row"><td>Index</td>${pattern.split('').map((_, i) => `<td>${i}</td>`).join('')}</tr>
                    <tr><td>Char</td>${pattern.split('').map(c => `<td>${c}</td>`).join('')}</tr>
                    <tr class="pat-lsp-row"><td>LSP</td>${lsp.map(val => `<td>${val}</td>`).join('')}</tr>
                </table>
            </div>
            <p style="font-size: 0.8rem; text-align: center; color: var(--text-secondary); max-width: 500px;">
                LSP[i] stores the length of the longest proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
            </p>
        </div>
    `;
    display.innerHTML = tableHTML;
    
    let i = 0;
    let j = 0;
    let step = 1;
    
    state.simInterval = setInterval(() => {
        if (i >= text.length) {
            logSimMessage("KMP Search complete. Reached end of text.", "success");
            showToast("Simulation Complete!", "success");
            handleSimulationStop();
            return;
        }
        
        let textRow = '';
        for (let idx = 0; idx < text.length; idx++) {
            let cls = '';
            if (idx === i) cls = 'sim-char-focus';
            textRow += `<span class="sim-char ${cls}">${text[idx]}</span>`;
        }
        
        let patPadding = '&nbsp;'.repeat(i - j);
        let patRow = patPadding;
        for (let idx = 0; idx < pattern.length; idx++) {
            let cls = '';
            if (idx === j) {
                cls = text[i] === pattern[j] ? 'sim-char-match' : 'sim-char-mismatch';
            }
            patRow += `<span class="sim-char ${cls}">${pattern[idx]}</span>`;
        }
        
        display.innerHTML = `
            <div class="sim-visualization-box">
                <div class="sim-visual-line">Text:    ${textRow}  (i = ${i})</div>
                <div class="sim-visual-line">Pattern: ${patRow}  (j = ${j})</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 15px;">Step ${step}: Comparing Text[${i}] ('${text[i]}') and Pattern[${j}] ('${pattern[j]}')</div>
            </div>
        `;
        
        if (pattern[j] === text[i]) {
            logSimMessage(`[Step ${step}] Match: Text[${i}] ('${text[i]}') == Pattern[${j}] ('${pattern[j]}'). Advance pointers.`, "success");
            i++;
            j++;
            
            if (j === pattern.length) {
                logSimMessage(`[✓] PATTERN FULLY MATCHED at index ${i - j}!`, "success");
                showToast(`Full Match found at Text index ${i - j}!`, "success");
                display.querySelector('.sim-visualization-box').style.animation = "flash-animation 1s ease";
                j = lsp[j - 1];
            }
        } else {
            logSimMessage(`[Step ${step}] Mismatch: Text[${i}] ('${text[i]}') != Pattern[${j}] ('${pattern[j]}').`, "danger");
            if (j !== 0) {
                logSimMessage(`└─ Shift Pattern: Slide j back to LSP[${j - 1}] = ${lsp[j - 1]}`, "warning");
                j = lsp[j - 1];
            } else {
                logSimMessage(`└─ Shift Text: Pointer j is 0. Advance text index i to ${i + 1}`, "warning");
                i++;
            }
        }
        
        step++;
    }, 1500);
}

function runRabinKarpSimulation(text, pattern) {
    const display = document.getElementById('sim-display');
    
    const prime = 101;
    const base = 26;
    const m = pattern.length;
    const n = text.length;
    
    logSimMessage(`Step 1: Calculating Pattern hash using modulus ${prime} and base ${base}...`, "warning");
    
    let patternHash = 0;
    for (let idx = 0; idx < m; idx++) {
        patternHash = (base * patternHash + pattern.charCodeAt(idx)) % prime;
    }
    
    logSimMessage(`└─ Pattern "${pattern}" Hash = ${patternHash}`, "success");
    
    let windowHash = 0;
    for (let idx = 0; idx < m; idx++) {
        windowHash = (base * windowHash + text.charCodeAt(idx)) % prime;
    }
    
    let h = 1;
    for (let idx = 0; idx < m - 1; idx++) {
        h = (h * base) % prime;
    }
    
    let i = 0;
    let step = 1;
    
    state.simInterval = setInterval(() => {
        if (i > n - m) {
            logSimMessage("Rabin-Karp Search complete. No further windows to check.", "success");
            showToast("Simulation Complete!", "success");
            handleSimulationStop();
            return;
        }
        
        const windowText = text.substring(i, i + m);
        
        let textRow = '';
        for (let idx = 0; idx < text.length; idx++) {
            let cls = '';
            if (idx >= i && idx < i + m) {
                cls = windowHash === patternHash ? 'sim-char-match' : 'sim-char-focus';
            }
            textRow += `<span class="sim-char ${cls}">${text[idx]}</span>`;
        }
        
        display.innerHTML = `
            <div class="sim-visualization-box">
                <div class="sim-visual-line">Text:    ${textRow}</div>
                <div class="sim-visual-line">Pattern: ${'&nbsp;'.repeat(i)}<span class="sim-char">${pattern}</span></div>
                
                <div style="margin-top: 15px; text-align: center;">
                    <div style="font-size: 0.9rem; font-weight: bold;">Window: "${windowText}" at Index ${i}</div>
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; margin-top: 5px; color: var(--text-secondary);">
                        Window Hash: <span style="color: ${windowHash === patternHash ? 'var(--accent-success)' : 'var(--text-primary)'}; font-weight: bold;">${windowHash}</span> 
                        | Pattern Hash: <span style="color: var(--accent-success); font-weight: bold;">${patternHash}</span>
                    </div>
                </div>
            </div>
        `;
        
        logSimMessage(`[Step ${step}] Evaluating Window "${windowText}" at index ${i}`, "warning");
        
        if (windowHash === patternHash) {
            logSimMessage(`└─ Hash Match! (${windowHash} == ${patternHash}). Verifying characters...`, "warning");
            
            let matched = true;
            for (let j = 0; j < m; j++) {
                if (text[i + j] !== pattern[j]) {
                    matched = false;
                    logSimMessage(`   [Collision] Char mismatch at index ${i + j}: text '${text[i + j]}' != pattern '${pattern[j]}'`, "danger");
                    break;
                }
            }
            
            if (matched) {
                logSimMessage(`   [✓] EXACT MATCH Confirmed at index ${i}!`, "success");
                showToast(`Match verified at text index ${i}!`, "success");
            }
        } else {
            logSimMessage(`└─ Hash Mismatch (${windowHash} != ${patternHash}). Slide window.`, "danger");
        }
        
        if (i < n - m) {
            const oldChar = text[i];
            const newChar = text[i + m];
            
            windowHash = (base * (windowHash - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % prime;
            if (windowHash < 0) windowHash += prime;
            
            logSimMessage(`└─ Rolling hash: Remove '${oldChar}', Add '${newChar}' -> New Hash = ${windowHash}`, "warning");
        }
        
        i++;
        step++;
    }, 2000);
}

function logSimMessage(msg, type = "normal") {
    const logsBox = document.getElementById('sim-logs-box');
    const entry = document.createElement('div');
    entry.className = `sim-log-entry sim-log-${type}`;
    entry.innerText = msg;
    logsBox.appendChild(entry);
    logsBox.scrollTop = logsBox.scrollHeight;
}

// ==========================================
// 8. WORD FREQUENCY ANALYSIS
// ==========================================

function getWordFrequency(text, topN = 15) {
    const stopWords = new Set(['the','a','an','in','on','at','is','it','to','of','and','or','for',
        'with','as','by','this','that','are','was','be','been','have','has','had','will',
        'can','do','not','but','from','we','i','you','they','he','she','its','our','their',
        'which','who','what','how','when','where','than','then','also','so','if','there','were','would']);
    
    const clean = cleanText(text);
    const words = tokenizeWords(clean).filter(w => w.length > 2 && !stopWords.has(w));
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);
}

function renderFrequencyChart(mode = 'original') {
    const origText = state.lastOriginalText;
    const subText = state.lastSubmittedText;
    
    if (!origText || !subText) return;
    
    document.getElementById('freq-placeholder').style.display = 'none';
    document.getElementById('freq-section').style.display = 'block';
    
    const chartArea = document.getElementById('freq-chart-area');
    
    let entries = [];
    let barClass = 'orig-bar';
    
    if (mode === 'original') {
        entries = getWordFrequency(origText, 15);
        barClass = 'orig-bar';
    } else if (mode === 'submitted') {
        entries = getWordFrequency(subText, 15);
        barClass = 'sub-bar';
    } else if (mode === 'shared') {
        // Words that appear in both docs
        const origFreq = Object.fromEntries(getWordFrequency(origText, 50));
        const subFreq = Object.fromEntries(getWordFrequency(subText, 50));
        const sharedKeys = Object.keys(origFreq).filter(w => subFreq[w]);
        entries = sharedKeys
            .map(w => [w, origFreq[w] + subFreq[w]])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
        barClass = 'sub-bar';
    }
    
    if (entries.length === 0) {
        chartArea.innerHTML = '<p style="color:var(--text-secondary); font-size:0.88rem;">No significant shared words found.</p>';
        return;
    }
    
    const maxCount = entries[0][1];
    
    chartArea.innerHTML = entries.map(([word, count]) => {
        const pct = Math.max(8, (count / maxCount) * 100);
        return `
            <div class="freq-row">
                <span class="freq-word">${word}</span>
                <div class="freq-bar-wrap">
                    <div class="freq-bar-fill ${barClass}" style="width:${pct}%">
                        <span class="freq-count">${count}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Animate bars (reset and re-trigger)
    requestAnimationFrame(() => {
        chartArea.querySelectorAll('.freq-bar-fill').forEach((bar, i) => {
            const target = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = target; }, i * 40);
        });
    });
}

// ==========================================
// 9. N-GRAM FINGERPRINT ANALYSIS
// ==========================================

function getNGrams(tokens, n) {
    const ngrams = new Set();
    for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.add(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
}

function renderNGramFingerprint() {
    const origText = state.lastOriginalText;
    const subText = state.lastSubmittedText;
    
    if (!origText || !subText) return;
    
    const n = parseInt(document.getElementById('ngram-size-select').value) || 3;
    
    document.getElementById('ngram-placeholder').style.display = 'none';
    document.getElementById('ngram-section').style.display = 'block';
    
    const origTokens = tokenizeWords(cleanText(origText));
    const subTokens = tokenizeWords(cleanText(subText));
    
    const origNGrams = getNGrams(origTokens, n);
    const subNGrams = getNGrams(subTokens, n);
    
    const shared = [...origNGrams].filter(g => subNGrams.has(g));
    const origOnly = [...origNGrams].filter(g => !subNGrams.has(g));
    const subOnly = [...subNGrams].filter(g => !origNGrams.has(g));
    
    // Stats
    const statsArea = document.getElementById('ngram-stats-area');
    const overlapPct = origNGrams.size > 0 ? ((shared.length / origNGrams.size) * 100).toFixed(1) : 0;
    statsArea.innerHTML = `
        <div class="ngram-stat-pill"><div class="dot" style="background:#ef4444;"></div>Shared: ${shared.length} (${overlapPct}%)</div>
        <div class="ngram-stat-pill"><div class="dot" style="background:#3b82f6;"></div>Ref Only: ${origOnly.length}</div>
        <div class="ngram-stat-pill"><div class="dot" style="background:#f59e0b;"></div>Sub Only: ${subOnly.length}</div>
        <div class="ngram-stat-pill"><div class="dot" style="background:#6366f1;"></div>Total Unique: ${new Set([...origNGrams, ...subNGrams]).size}</div>
    `;
    
    // Chips — limit to 80 total for performance
    const chipArea = document.getElementById('ngram-chip-area');
    const sharedChips = shared.slice(0, 40).map(g => `<span class="ngram-chip shared" title="Found in both documents">${g}</span>`);
    const origChips = origOnly.slice(0, 20).map(g => `<span class="ngram-chip orig-only" title="Reference only">${g}</span>`);
    const subChips = subOnly.slice(0, 20).map(g => `<span class="ngram-chip sub-only" title="Submission only">${g}</span>`);
    
    chipArea.innerHTML = [...sharedChips, ...origChips, ...subChips].join('');
}

// ==========================================
// 10. SENTENCE RISK TIMELINE
// ==========================================

function renderRiskTimeline(submittedText, matchedSentences) {
    const sentences = splitIntoSentences(submittedText);
    if (sentences.length === 0) return;
    
    document.getElementById('risk-timeline-placeholder').style.display = 'none';
    document.getElementById('risk-timeline-wrap').style.display = 'block';
    
    const matchedIndices = new Set(matchedSentences.map(m => m.index));
    const matchedWordCounts = {};
    matchedSentences.forEach(m => { matchedWordCounts[m.index] = m.wordCount; });
    
    const totalWords = sentences.reduce((sum, s) => sum + tokenizeWords(cleanText(s)).length, 0);
    const maxWords = Math.max(...sentences.map(s => tokenizeWords(cleanText(s)).length), 1);
    
    const barsContainer = document.getElementById('risk-timeline-bars');
    
    barsContainer.innerHTML = sentences.map((sentence, idx) => {
        const words = tokenizeWords(cleanText(sentence));
        const wordCount = words.length;
        const heightPct = Math.max(8, (wordCount / maxWords) * 100);
        
        let riskClass = 'safe';
        let tooltip = `Sentence ${idx + 1}: ${wordCount} words — Original`;
        
        if (wordCount < 2) {
            riskClass = 'zero';
            tooltip = `Sentence ${idx + 1}: Too short to check`;
        } else if (matchedIndices.has(idx)) {
            riskClass = 'danger';
            tooltip = `Sentence ${idx + 1}: ${wordCount} words — PLAGIARIZED`;
        } else {
            // Check partial overlap using token intersection
            const sentenceTokens = new Set(words);
            const origTokens = state.lastOriginalText ? new Set(tokenizeWords(cleanText(state.lastOriginalText))) : new Set();
            const intersection = [...sentenceTokens].filter(t => origTokens.has(t));
            const overlapRatio = sentenceTokens.size > 0 ? intersection.length / sentenceTokens.size : 0;
            if (overlapRatio >= 0.5) {
                riskClass = 'medium';
                tooltip = `Sentence ${idx + 1}: ${wordCount} words — ${Math.round(overlapRatio * 100)}% word overlap`;
            }
        }
        
        return `<div class="risk-bar ${riskClass}" style="height:${heightPct}%;" title="${tooltip}" data-idx="${idx}"></div>`;
    }).join('');
    
    // Labels
    document.getElementById('risk-mid-label').innerText = `Sentence ${Math.ceil(sentences.length / 2)}`;
    document.getElementById('risk-end-label').innerText = `Sentence ${sentences.length}`;
    
    // Click to scroll to sentence
    barsContainer.querySelectorAll('.risk-bar').forEach(bar => {
        bar.addEventListener('click', () => {
            const idx = parseInt(bar.dataset.idx);
            const subPane = document.getElementById('highlighted-submitted');
            const sentEl = document.getElementById(`sub-sentence-${idx}`);
            if (sentEl) {
                sentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                sentEl.classList.add('active');
                setTimeout(() => sentEl.classList.remove('active'), 2000);
            }
        });
    });
}

// ==========================================
// 11. EXPORT FUNCTIONS
// ==========================================

function exportJSONData() {
    if (!state.lastResults) {
        showToast('Run an analysis first before exporting.', 'danger');
        return;
    }
    
    const exportData = {
        timestamp: new Date().toISOString(),
        algorithm: state.lastResults.algorithm_used || 'kmp',
        metrics: {
            plagiarismPercentage: state.lastResults.plagiarismPercentage,
            jaccardSimilarity: state.lastResults.jaccardSimilarity,
            containmentScore: state.lastResults.containmentScore,
            minhashSimilarity: state.lastResults.minhashSimilarity
        },
        statistics: {
            totalSentences: state.lastResults.totalSubmittedSentences,
            matchedSentences: state.lastResults.matchedSentences.length,
            totalComparisons: state.lastResults.totalComparisons,
            executionTimeMs: state.lastResults.totalExecutionTimeMs
        },
        matchedSegments: state.lastResults.matchedSentences.map(m => ({
            sentenceIndex: m.index,
            text: m.rawText,
            wordCount: m.wordCount,
            matchPositions: m.matchesInRef
        }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON data exported successfully!', 'success');
}

function exportPDFReport() {
    if (!state.lastResults) {
        showToast('Run an analysis first before exporting.', 'danger');
        return;
    }
    
    const r = state.lastResults;
    const timestamp = new Date().toLocaleString();
    
    // Build a printable HTML page
    const printHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plagiarism Report — ${timestamp}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; }
        h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
        h2 { color: #334155; margin-top: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 15px; margin: 20px 0; }
        .metric-box { border: 2px solid #e2e8f0; border-radius: 10px; padding: 15px; text-align: center; }
        .metric-val { font-size: 2rem; font-weight: 800; }
        .metric-lbl { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .red { color: #dc2626; } .blue { color: #2563eb; } .amber { color: #d97706; } .purple { color: #7c3aed; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
        th { background: #f8fafc; font-weight: 700; color: #475569; }
        .match-item { background: #fef2f2; border-left: 4px solid #dc2626; margin: 8px 0; padding: 10px 14px; border-radius: 4px; font-size:0.88rem; }
        footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    </style>
</head>
<body>
    <h1>🔍 Plagiarism Detection Analysis Report</h1>
    <p><strong>Generated:</strong> ${timestamp} &nbsp;|&nbsp; <strong>Algorithm:</strong> KMP / Rabin-Karp / Naive Benchmark</p>
    
    <h2>Similarity Metrics</h2>
    <div class="metric-grid">
        <div class="metric-box"><div class="metric-val red">${r.plagiarismPercentage}%</div><div class="metric-lbl">Plagiarism Score</div></div>
        <div class="metric-box"><div class="metric-val blue">${r.jaccardSimilarity}%</div><div class="metric-lbl">Jaccard Similarity</div></div>
        <div class="metric-box"><div class="metric-val amber">${r.containmentScore}%</div><div class="metric-lbl">Containment Score</div></div>
        <div class="metric-box"><div class="metric-val purple">${r.minhashSimilarity || 0}%</div><div class="metric-lbl">MinHash Similarity</div></div>
    </div>
    
    <h2>Performance Statistics</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total Sentences Checked</td><td>${r.totalSubmittedSentences}</td></tr>
        <tr><td>Plagiarized Sentences Found</td><td>${r.matchedSentences.length}</td></tr>
        <tr><td>Character Comparisons Made</td><td>${r.totalComparisons.toLocaleString()}</td></tr>
        <tr><td>Algorithm Execution Time</td><td>${r.totalExecutionTimeMs.toFixed(4)} ms</td></tr>
    </table>
    
    <h2>Flagged Sentence Matches (${r.matchedSentences.length})</h2>
    ${r.matchedSentences.map((m, i) => `
        <div class="match-item">
            <strong>Match #${i+1}</strong> (Sentence ${m.index+1}, ${m.wordCount} words)<br>
            "${m.rawText}"
        </div>
    `).join('') || '<p>No matches detected.</p>'}
    
    <footer>Plagiarism Detector — DSA Course Project | String Matching Algorithms</footer>
</body>
</html>`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.print();
    };
    showToast('PDF export window opened — use your browser\'s Print dialog to save as PDF.', 'success');
}

// ==========================================
// 12. INTERVIEW PREP FLASHCARDS
// ==========================================

const FLASHCARD_DATA = [
    {
        q: "What is the time complexity of the KMP (Knuth-Morris-Pratt) algorithm and why is it better than Naive?",
        a: "KMP runs in O(N + M) time where N is the text length and M is the pattern length. Unlike Naive (O(N*M)), KMP precomputes a Longest Proper Prefix-Suffix (LPS/LSP) table in O(M) time, allowing it to skip redundant character comparisons by remembering how much of the pattern already matched — never backtracking the text pointer.",
        difficulty: "medium"
    },
    {
        q: "Explain the Rolling Hash technique in Rabin-Karp. How does it achieve O(1) hash updates?",
        a: "Rabin-Karp uses H(i+1) = (base*(H(i) − text[i]*h) + text[i+M]) % prime. By subtracting the outgoing character's contribution and adding the incoming character, it shifts the hash window in O(1) time instead of recomputing from scratch in O(M). The variable h = base^(M-1) % prime is precomputed once.",
        difficulty: "hard"
    },
    {
        q: "What is Jaccard Similarity? How is it different from Containment Score?",
        a: "Jaccard = |A∩B| / |A∪B| — measures symmetric overlap of two sets (both directions). Containment = |A∩B| / |A| — measures how much of A is contained in B (one-directional). Containment is better for detecting short copied sections inside a large database since dividing by |A| keeps the score high even when B is much larger.",
        difficulty: "medium"
    },
    {
        q: "What is a hash collision in Rabin-Karp and how is it handled?",
        a: "A hash collision occurs when two different substrings produce the same hash value (false positive). Rabin-Karp handles this by performing a character-by-character verification whenever the window hash equals the pattern hash. This keeps average case O(N+M) but in worst case with many collisions it degrades to O(N*M).",
        difficulty: "medium"
    },
    {
        q: "What is the LSP (Longest Suffix Prefix) table in KMP? Walk through computing it for pattern 'ABABCABAB'.",
        a: "LSP[i] = length of the longest proper prefix of pattern[0..i] that is also a suffix. For 'ABABCABAB': [0,0,1,2,0,1,2,3,4]. When a mismatch occurs at j, instead of resetting j=0, we set j=LSP[j-1], retaining matched prefix knowledge. This is the key optimization that makes KMP linear.",
        difficulty: "hard"
    },
    {
        q: "What is MinHash and how does it approximate Jaccard Similarity?",
        a: "MinHash generates k signature values per document using k different hash functions. For each hash function h_i, MinHash signature[i] = min(h_i(token)) across all tokens. Similarity is estimated as fraction of identical positions between two signatures: sim ≈ matches/k. With k=50-100 functions, error is ~1/√k. Complexity is O(k*|tokens|) vs O(N²) for exact comparison.",
        difficulty: "hard"
    },
    {
        q: "Why does Naive string matching have O(N*M) worst case complexity? Give an example.",
        a: "In the worst case, every position in the text requires comparing all M characters of the pattern before a mismatch. Example: text = 'aaaaaaaaab' (N a's then b), pattern = 'aaab'. At every index i from 0 to N-M, we compare M characters, giving N*M total comparisons. KMP avoids this by using the LSP table to skip positions.",
        difficulty: "easy"
    },
    {
        q: "What is an N-Gram and how is it used in plagiarism detection?",
        a: "An N-gram is a contiguous sequence of N words (or characters). Trigrams (N=3) of 'the quick brown fox' → {the quick brown, quick brown fox}. For plagiarism, N-gram overlap between two documents is computed as shared N-grams / union. Higher overlap indicates likely copying. N-grams catch paraphrasing better than exact string matching because word order is preserved.",
        difficulty: "easy"
    },
    {
        q: "What data structure does the KMP failure function use internally? What is its space complexity?",
        a: "KMP uses a 1D integer array (the LSP/failure table) of size M, where M is the pattern length. Space complexity is O(M). The preprocessing phase fills this array in O(M) time using two pointers (length and i). This is the only auxiliary space needed — making KMP space-efficient compared to suffix trees.",
        difficulty: "medium"
    },
    {
        q: "How would you extend this plagiarism detector to handle multiple languages or PDFs?",
        a: "For multiple languages: use language-specific tokenizers (NLTK, spaCy) and Unicode-aware cleaning. For PDFs: use PyMuPDF or pdfminer to extract text before passing to the pipeline. For scalability: index reference documents using LSH (Locality Sensitive Hashing) with MinHash signatures in a hash table — enabling sub-linear lookup across millions of documents instead of linear scan.",
        difficulty: "hard"
    },
    {
        q: "What is the Boyer-Moore algorithm and how does it compare to KMP?",
        a: "Boyer-Moore shifts the pattern right using two heuristics: Bad Character (jump to align mismatched text char with its last occurrence in pattern) and Good Suffix (jump based on matched suffix). Boyer-Moore achieves O(N/M) best case (sub-linear!) — much faster than KMP's O(N+M) in practice for large alphabets. However, KMP has better worst-case guarantees and is simpler to implement.",
        difficulty: "hard"
    },
    {
        q: "Explain the significance of choosing a good prime modulus in Rabin-Karp. What happens with a small prime?",
        a: "A large prime (like 10^9+7 or 2^31-1) minimizes hash collisions by spreading hash values uniformly across a larger range. With a small prime (like 7), many different substrings will hash to the same value, causing frequent false positives — requiring expensive character-by-character verification and degrading performance toward O(N*M). The prime must also be coprime with the base for uniform distribution.",
        difficulty: "hard"
    }
];

let flashcardAnsweredCount = 0;
const flashcardRevealed = new Set();

function initFlashcards() {
    const grid = document.getElementById('flashcard-grid');
    
    grid.innerHTML = FLASHCARD_DATA.map((card, idx) => `
        <div class="flashcard" id="fc-${idx}">
            <span class="flashcard-difficulty diff-${card.difficulty}">${card.difficulty}</span>
            <div class="flashcard-q">
                <div class="flashcard-q-label">Q${idx + 1} · Interview Question</div>
                <div class="flashcard-q-text">${card.q}</div>
            </div>
            <div class="flashcard-a" id="fc-answer-${idx}">
                <strong style="color:var(--accent-success); display:block; margin-bottom:8px;">✅ Answer:</strong>
                ${card.a}
            </div>
            <button class="flashcard-toggle" data-idx="${idx}">
                👁 Reveal Answer
            </button>
        </div>
    `).join('');
    
    grid.querySelectorAll('.flashcard-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            const answerEl = document.getElementById(`fc-answer-${idx}`);
            const isRevealed = answerEl.classList.contains('revealed');
            
            if (!isRevealed) {
                answerEl.classList.add('revealed');
                btn.innerText = '🔼 Hide Answer';
                if (!flashcardRevealed.has(idx)) {
                    flashcardRevealed.add(idx);
                    flashcardAnsweredCount++;
                    updateFlashcardProgress();
                }
            } else {
                answerEl.classList.remove('revealed');
                btn.innerText = '👁 Reveal Answer';
            }
        });
    });
    
    updateFlashcardProgress();
}

function updateFlashcardProgress() {
    const total = FLASHCARD_DATA.length;
    const pct = (flashcardAnsweredCount / total) * 100;
    document.getElementById('interview-progress-label').innerText = `${flashcardAnsweredCount} / ${total} Answered`;
    document.getElementById('interview-progress-fill').style.width = `${pct}%`;
}

function resetFlashcards() {
    flashcardAnsweredCount = 0;
    flashcardRevealed.clear();
    document.querySelectorAll('.flashcard-a').forEach(el => el.classList.remove('revealed'));
    document.querySelectorAll('.flashcard-toggle').forEach(btn => btn.innerText = '👁 Reveal Answer');
    updateFlashcardProgress();
    showToast('All flashcards reset. Start reviewing again!', 'success');
}
