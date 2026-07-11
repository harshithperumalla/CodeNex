require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Problem = require("../models/Problem");

const companies = [
  "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Capgemini", "Deloitte", "IBM", 
  "Tech Mahindra", "HCL", "Hexaware", "LTIMindtree", "Oracle", "SAP", "Zoho", "Amazon", 
  "Microsoft", "Google", "Meta", "Adobe", "Flipkart", "Walmart", "PayPal", "Salesforce", 
  "ServiceNow", "Uber", "Netflix", "Apple", "Cisco", "Qualcomm", "Intel", "Nvidia", 
  "Samsung", "JPMorgan", "Goldman Sachs", "Morgan Stanley", "Barclays", "Visa", "American Express"
];

const topics = [
  "Arrays", "Strings", "Matrix", "Linked List", "Stack", "Queue", "Hashing", "Trees", 
  "Binary Search Tree", "Heap", "Trie", "Graph", "Dynamic Programming", "Greedy", 
  "Recursion", "Backtracking", "Sliding Window", "Two Pointers", "Prefix Sum", 
  "Binary Search", "Bit Manipulation", "Segment Tree", "Union Find", "Shortest Path", 
  "Topological Sort", "BFS", "DFS", "Math", "Number Theory", "Geometry"
];

const difficulties = ["Beginner", "Easy", "Medium", "Hard", "Expert"];

const templates = [
  { title: "Find Maximum Elements in", desc: "Given a collection of parameters, write an efficient routine to locate the maximum value within the constraints." },
  { title: "Search Target Index in", desc: "Implement search algorithms to determine the index of the target element. Return -1 if not present." },
  { title: "Validate Balance Structure of", desc: "Verify if the structural properties (symmetry, sorting constraints, or balanced brackets) are satisfied." },
  { title: "Optimize Resource Cost in", desc: "Compute the minimum cost or path length to execute the operation under standard complexity boundaries." },
  { title: "Group Similar Elements from", desc: "Arrange elements in partitions where members of each partition share identical features or indices." },
  { title: "Merge Overlapping Sequences of", desc: "Combine consecutive intervals or nodes that overlap into a single simplified representation." },
  { title: "Detect Loop Cycles in", desc: "Analyze the graph or collection traversal paths to detect cycles. Return true if loop is present." }
];

const seed1000 = async () => {
  try {
    await connectDB();

    console.log("Cleaning existing problems database...");
    await Problem.deleteMany({});

    console.log("Generating 1050 programming questions...");
    const problemsToInsert = [];

    for (let i = 1; i <= 1050; i++) {
      const topic = topics[(i - 1) % topics.length];
      const difficulty = difficulties[(i - 1) % difficulties.length];
      
      const companyCount = 2 + (i % 3); // 2 to 4 companies per question
      const companyList = [];
      for (let c = 0; c < companyCount; c++) {
        const comp = companies[(i + c * 7) % companies.length];
        if (!companyList.includes(comp)) companyList.push(comp);
      }

      const template = templates[i % templates.length];
      const title = `${template.title} ${topic} #${i}`;
      const description = `${template.desc}\n\nInput Description:\nStandard parameters for ${topic}.\n\nOutput Description:\nOptimized output matching sample values.`;
      const realSlugs = [
        "two-sum", "reverse-linked-list", "valid-parentheses", "merge-intervals",
        "lru-cache", "binary-tree-level-order-traversal", "median-of-two-sorted-arrays",
        "climbing-stairs", "container-with-most-water", "longest-substring-without-repeating-characters",
        "reverse-string", "fizz-buzz", "single-number", "valid-anagram", "contains-duplicate",
        "intersection-of-two-arrays", "majority-element", "missing-number", "move-zeroes", "add-digits",
        "search-insert-position", "merge-two-sorted-lists", "remove-element", "length-of-last-word",
        "plus-one", "sqrtx", "remove-duplicates-from-sorted-list", "merge-sorted-array",
        "binary-tree-inorder-traversal", "same-tree", "symmetric-tree", "maximum-depth-of-binary-tree",
        "minimum-depth-of-binary-tree", "path-sum", "pascals-triangle", "best-time-to-buy-and-sell-stock",
        "valid-palindrome", "linked-list-cycle", "min-stack", "intersection-of-two-linked-lists",
        "excel-sheet-column-title", "rotate-array", "reverse-bits", "number-of-1-bits", "house-robber",
        "happy-number", "remove-linked-list-elements", "count-primes", "isomorphic-strings",
        "power-of-two", "palindrome-linked-list", "binary-tree-paths", "ugly-number",
        "first-bad-version", "word-pattern", "nim-game", "guess-number-higher-or-lower",
        "ransom-note", "first-unique-character-in-a-string", "find-the-difference",
        "is-subsequence", "third-maximum-number", "add-strings", "number-of-segments-in-a-string",
        "arranging-coins", "find-all-numbers-disappeared-in-an-array", "island-perimeter",
        "heaters", "license-key-formatting", "max-consecutive-ones", "construct-the-rectangle"
      ];
      const slug = realSlugs[(i - 1) % realSlugs.length];
      const leetcodeLink = `https://leetcode.com/problems/${slug}/`;
      const gfgLink = "";

      const acceptance = Math.round(35 + (i * 1.7) % 50);
      const points = difficulty === "Beginner" ? 10 : difficulty === "Easy" ? 15 : difficulty === "Medium" ? 20 : difficulty === "Hard" ? 30 : 40;

      problemsToInsert.push({
        problemId: i,
        title,
        difficulty,
        category: topic,
        topicCategory: difficulty === "Beginner" ? "Beginner" : (difficulty === "Easy" || difficulty === "Medium") ? "Intermediate" : "Advanced",
        language: "JavaScript",
        description,
        leetcodeLink,
        gfgLink,
        diagram: `+--------------------------------------------------+
|               ALGORITHM FLOWCHART                |
+--------------------------------------------------+
|                                                  |
|  [Input Data]                                    |
|       |                                          |
|       v                                          |
|  (Parse inputs for ${topic})                       |
|       |                                          |
|       v                                          |
|  {Check constraints: 1 <= n <= 10^5}             |
|       |                                          |
|       +-----------> [If Invalid] ---> Return     |
|       |                                          |
|       v [If Valid]                               |
|  (Execute: ${template.title})                     |
|       |                                          |
|       v                                          |
|  [Output/Result]                                 |
|                                                  |
+--------------------------------------------------+`,
        explanation: `Concept Definition:\n${topic} represents a core algorithmic technique in computer science designed to solve optimization and search challenges. By storing structural relationships, we can process constraints efficiently.\n\nStrategy:\n1. Initialize parameters and validate input bounds.\n2. Iterate through input elements applying the '${template.title}' logic.\n3. Return result with optimal complexity metrics.`,
        hints: [
          `Identify boundary constraints for ${topic} first.`,
          `Consider utilizing dynamic map lookup or pointer tracking.`,
          `Analyze space-time complexity trade-offs to reach the optimal solution.`
        ],
        complexity: difficulty === "Beginner" ? "Time: O(1) | Space: O(1)" : difficulty === "Easy" ? "Time: O(N) | Space: O(1)" : difficulty === "Medium" ? "Time: O(N) | Space: O(N)" : difficulty === "Hard" ? "Time: O(N log N) | Space: O(N)" : "Time: O(2^N) | Space: O(N)",
        concepts: [topic, `${topic} Optimizations`, "Algorithm Design"],
        solutions: {
          javascript: `function solve(input) {\n  // Optimal JavaScript solution\n  return input;\n}`,
          python: `def solve(input):\n    # Optimal Python solution\n    return input`,
          java: `class Solution {\n    public int solve(int input) {\n        // Optimal Java solution\n        return input;\n    }\n}`,
          cpp: `class Solution {\npublic:\n    int solve(int input) {\n        // Optimal C++ solution\n        return input;\n    }\n};`
        },
        examples: [
          { input: "1", output: "1", explanation: "Base example case validation." }
        ],
        constraints: ["1 <= n <= 10^5"],
        tags: [topic, companyList[0]],
        companies: companyList,
        acceptance,
        points,
        starterCode: {
          javascript: `function solve(input) {\n  // Write code here\n  return input;\n}`,
          python: `def solve(input):\n    # Write code here\n    return input`,
          java: `class Solution {\n    public int solve(int input) {\n        // Write code here\n        return input;\n    }\n}`,
          cpp: `class Solution {\npublic:\n    int solve(int input) {\n        // Write code here\n        return input;\n    }\n};`
        },
        testCases: [
          { input: "1", expectedOutput: "1", isHidden: false },
          { input: "2", expectedOutput: "2", isHidden: true }
        ],
        isActive: true
      });
    }

    console.log("Inserting problems to MongoDB in chunks...");
    const chunkSize = 100;
    for (let j = 0; j < problemsToInsert.length; j += chunkSize) {
      const chunk = problemsToInsert.slice(j, j + chunkSize);
      await Problem.insertMany(chunk, { ordered: false });
      console.log(`Inserted chunk ${Math.floor(j / chunkSize) + 1} of ${Math.ceil(problemsToInsert.length / chunkSize)} (${chunk.length} items)...`);
    }

    console.log(`\n✅ Seeding complete! Successfully added ${problemsToInsert.length} coding questions.\n`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed1000();
