const axios = require("axios");

// Admin Dashboard static queries
exports.ask = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  const lower = message.toLowerCase();
  let reply =
    "I can help with revenue, users, courses, and platform health. Try asking about signups or revenue.";

  if (lower.includes("revenue") || lower.includes("payment")) {
    reply = "Revenue this month is trending up 23% compared to last month.";
  } else if (lower.includes("user") || lower.includes("signup")) {
    reply = "You have steady new signups this week. Retention is strong among coding users.";
  } else if (lower.includes("course")) {
    reply = "Top courses: React Masterclass, DSA with Java, and Full-Stack MERN.";
  }

  res.json({ success: true, reply });
};

// Offline simulator responses
const simulatedResponses = {
  recursion: `🔄 **Recursion Concept Guide:**\n\nRecursion is a programming technique where a function calls itself to solve a smaller instance of the same problem.\n\n### 🔑 Key Requirements:\n1. **Base Case:** The condition under which the recursion stops.\n2. **Recursive Step:** The logic that calls the function itself with modified arguments.\n\n### 💻 Java Code Example (Factorial):\n\`\`\`java\npublic class Recursion {\n    public static int factorial(int n) {\n        if (n <= 1) return 1; // Base case\n        return n * factorial(n - 1); // Recursive call\n    }\n}\n\`\`\`\n\n### ⏱️ Time Complexity:\n- O(n) for simple linear recursion.\n- O(2ⁿ) for multiple recursive branches (like naive Fibonacci).\n\n💡 *Tip: Check the recursion call stack to trace execution!*`,
  
  array: `📦 **Arrays & Lists Guide:**\n\nAn array is a linear data structure that stores elements of the same type at contiguous memory locations.\n\n### 📈 Operations & Complexity:\n- **Access:** O(1) - immediate index check\n- **Search (Linear):** O(n)\n- **Search (Binary - Sorted):** O(log n)\n- **Insertion/Deletion:** O(n) (requires element shifting)\n\n### 💻 Python Code Example (Reverse Array):\n\`\`\`python\ndef reverse_array(arr):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n    return arr\n\`\`\`\n\n🔥 *Top Array patterns: Two Pointers, Sliding Window, Prefix Sum, Kadane's Algorithm.*`,
  
  sort: `📊 **Sorting Algorithms Comparison:**\n\nSorting rearranges elements in an array in a specific order (ascending/descending).\n\n| Algorithm | Best Time | Average Time | Worst Time | Space | Stable |\n|-----------|-----------|--------------|------------|-------|--------|\n| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Merge | O(n log n)| O(n log n) | O(n log n) | O(n) | Yes |\n| Quick | O(n log n)| O(n log n) | O(n²) | O(log n)| No |\n| Heap | O(n log n)| O(n log n) | O(n log n) | O(1) | No |\n\n💡 *Use Merge Sort for linked lists and stable sorting, Quick Sort for arrays in-place!*`,

  stack: `🥞 **Stacks (LIFO) Explained:**\n\nA stack is a Last-In-First-Out data structure. Think of a stack of plates: the last plate placed is the first one removed.\n\n### 🛠️ Common Operations:\n- **push(x):** Add element to top - O(1)\n- **pop():** Remove element from top - O(1)\n- **peek():** Look at top element without removing - O(1)\n\n### 💻 JavaScript Code (Bracket Check):\n\`\`\`javascript\nfunction checkParentheses(str) {\n  let stack = [];\n  for (let char of str) {\n    if (char === '(') stack.push(char);\n    else if (char === ')') {\n      if (stack.length === 0) return false;\n      stack.pop();\n    }\n  }\n  return stack.length === 0;\n}\n\`\`\`\n\n🎯 *Common interview questions: Valid Parentheses, Daily Temperatures, Next Greater Element.*`,

  "linked list": `🔗 **Linked Lists Overview:**\n\nA linked list is a dynamic linear data structure where elements (nodes) are stored as separate objects connected via pointers/references.\n\n### 📈 Operations:\n- **Insert/Delete at Head:** O(1)\n- **Search/Delete by Key:** O(n)\n- **Traversal:** O(n)\n\n### 💻 Python Code (Node Definition):\n\`\`\`python\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\`\`\`\n\n⭐ *Patterns to master: Floyd's Cycle Detection (Tortoise and Hare), Reverse Linked List, Dummy Nodes.*`,

  aptitude: `🧮 **Aptitude Formulas & Shortcuts:**\n\nMastering these core topics helps clear placement exams:\n\n1. **Time and Work:**\n   - Work = Efficiency × Time\n   - If A takes X days and B takes Y days, together they take \`(X * Y) / (X + Y)\` days.\n2. **Time Speed and Distance:**\n   - Distance = Speed × Time\n   - Convert km/hr to m/s: multiply by \`5/18\`\n3. **Percentages:**\n   - Net change of successive x% increase followed by y% decrease: \`x - y - (x*y)/100\`\n\n💡 *Tip: Memorize squares up to 30 and cubes up to 15 to perform division quickly.*`,

  english: `📚 **English & Communication Tips:**\n\nTo excel in placements and technical rounds, focus on communication:\n\n1. **STAR Method for behavioral queries:**\n   - **S**ituation (Context)\n   - **T**ask (Challenge)\n   - **A**ction (Your work)\n   - **R**esult (Outcomes and data)\n2. **Avoid Fillers:** Minimize "um", "ah", "basically", "like". Pause silently instead.\n3. **Subject-Verb Agreement:** Watch out for "He plays" vs "They play".\n\n🗣️ *Tip: Speak slowly, maintain steady eye contact, and structure your responses systematically.*`,

  "dynamic programming": `⚡ **Dynamic Programming (DP):**\n\nDynamic Programming optimizes standard recursions by caching solutions to overlapping subproblems.\n\n### 🛠️ Recipe to solve DP:\n1. Check for overlapping subproblems and optimal substructure.\n2. Write a recursive relation.\n3. Add memoization (Top-down) or tabulation (Bottom-up).\n\n### 💻 JavaScript Code (Fibonacci with Memo):\n\`\`\`javascript\nfunction fib(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n  return memo[n];\n}\n\`\`\`\n\n🔥 *Practice: Climbing Stairs, Coin Change, Longest Common Subsequence.*`,
};

// Student Chatbot API
exports.chatWithAI = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: "Messages history array is required" });
  }

  const userApiKey = process.env.GEMINI_API_KEY;

  if (userApiKey) {
    try {
      // Map frontend conversation role to Gemini API roles ('user' -> 'user', 'assistant' -> 'model')
      const contents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Call Google Gemini API beta generateContent endpoint
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userApiKey}`,
        { contents },
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const reply = response.data.candidates[0].content.parts[0].text;
        return res.json({ success: true, reply });
      }
    } catch (err) {
      console.error("⚠️ Gemini API Request failed. Falling back to simulator. Error:", err.message);
    }
  }

  // Fallback Simulator Mode
  const lastMessage = messages[messages.length - 1]?.content || "";
  const lowerMsg = lastMessage.toLowerCase();
  
  let matchedReply = "";
  for (const [key, resp] of Object.entries(simulatedResponses)) {
    if (lowerMsg.includes(key)) {
      matchedReply = resp;
      break;
    }
  }

  if (!matchedReply) {
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
      matchedReply = "👋 Hey there! I'm your **CodeNex AI Mentor**.\n\nI can help with coding concepts, DSA algorithms, aptitude problems, or English prep. What are you studying today?";
    } else if (lowerMsg.includes("help") || lowerMsg.includes("how")) {
      matchedReply = "🤔 I can help you with:\n\n- 💻 **DSA topics:** recursion, arrays, sorting, dynamic programming, stacks, linked lists.\n- 🧮 **Aptitude support:** percentage, time/work formulas.\n- 📚 **English prep:** STAR method, speech tips.\n\nJust tell me what concept you need help with!";
    } else if (lowerMsg.includes("thank")) {
      matchedReply = "😊 Happy to help! Keep learning and practicing. You're doing great! 🚀";
    } else {
      matchedReply = "🤖 I'm here to support your learning journey!\n\n**Try asking me about:**\n- \"Explain recursion in Java\"\n- \"Help with arrays in Python\"\n- \"Tips for aptitude exams\"\n- \"Common English interview prep\"\n- \"Compare sorting algorithms\"\n\nJust write any topic and I will give you a detailed explanation!";
    }
  }

  // Append developer hint
  matchedReply += "\n\n*(Note: Running in AI Simulator Mode. Add GEMINI_API_KEY to your backend .env to enable real-time Gemini AI.)*";

  res.json({ success: true, reply: matchedReply });
};
