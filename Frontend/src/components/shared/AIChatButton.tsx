import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Loader2, Code2, Brain, BookOpen, Lightbulb, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";

type Message = { role: "user" | "assistant"; content: string };

// Simple inline parser for **bold** and `code`
const parseInlineStyles = (text: string) => {
  let html = text;
  // bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  // inline code `text`
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 font-mono text-[11px] text-cyan-300">$1</code>');
  return html;
};

const Markdown = ({ content }: { content: string }) => {
  // Split by code blocks
  const parts = content.split("```");
  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        const isCode = index % 2 === 1;
        if (isCode) {
          // Extract language
          const lines = part.split("\n");
          const lang = lines[0].trim();
          const code = lines.slice(1).join("\n").trim();
          
          return (
            <div key={index} className="relative rounded-lg bg-black/60 border border-white/10 my-2 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 text-[10px] text-muted-foreground border-b border-white/5">
                <span>{lang || "code"}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    toast.success("Copied to clipboard!");
                  }}
                  className="hover:text-foreground transition-colors font-sans px-1.5 py-0.5 rounded bg-white/10"
                >
                  Copy
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-cyan-300 leading-relaxed max-w-full">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        
        // Handle lists, inline code, bold text, tables
        return (
          <div key={index} className="space-y-1.5">
            {part.split("\n").map((line, lIdx) => {
              let trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;
              
              // Tables
              if (trimmed.startsWith("|")) {
                const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
                if (cells.some(c => c.startsWith("-"))) return null; // skip separator row
                return (
                  <div key={lIdx} className="grid grid-flow-col auto-cols-fr gap-2 bg-white/5 p-2 rounded text-xs border border-white/5">
                    {cells.map((cell, cIdx) => (
                      <div key={cIdx} className="font-semibold text-foreground truncate">{cell}</div>
                    ))}
                  </div>
                );
              }

              // Headings
              if (trimmed.startsWith("### ")) {
                return <h4 key={lIdx} className="text-sm font-bold text-foreground mt-2 mb-1">{trimmed.slice(4)}</h4>;
              }
              if (trimmed.startsWith("## ")) {
                return <h3 key={lIdx} className="text-base font-bold text-foreground mt-3 mb-1.5">{trimmed.slice(3)}</h3>;
              }
              
              // Lists
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                const listText = trimmed.slice(2);
                return (
                  <div key={lIdx} className="flex gap-1.5 pl-2 text-xs text-muted-foreground">
                    <span>•</span>
                    <span dangerouslySetInnerHTML={{ __html: parseInlineStyles(listText) }} />
                  </div>
                );
              }

              // Default text
              return (
                <p
                  key={lIdx}
                  className="text-xs text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseInlineStyles(line) }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const quickReplies = [
  "Explain Big O notation",
  "Help with arrays in Java",
  "Tips for aptitude exams",
  "Common English mistakes",
];

const topicResponses: Record<string, string> = {
  // DSA & Coding
  "big o": "📐 **Big O Notation Explained:**\n\nBig O describes the **worst-case time complexity** of an algorithm.\n\n• **O(1)** — Constant: Array access by index\n• **O(log n)** — Logarithmic: Binary search\n• **O(n)** — Linear: Single loop\n• **O(n log n)** — Merge sort, Quick sort\n• **O(n²)** — Nested loops: Bubble sort\n• **O(2ⁿ)** — Exponential: Recursive Fibonacci\n\n💡 **Pro tip:** Always aim to reduce nested loops!",
  "array": "📦 **Arrays – Key Concepts:**\n\n**Java Arrays:**\n```\nint[] arr = new int[5];\nint[] arr = {1, 2, 3, 4, 5};\n```\n\n**Common Operations:**\n• Access: O(1)\n• Search: O(n)\n• Insert at end: O(1) amortized\n• Insert at index: O(n)\n\n**Must-know patterns:**\n1. Two Pointer technique\n2. Sliding Window\n3. Prefix Sum\n4. Kadane's Algorithm\n\n🔥 Practice: Start with LeetCode Easy array problems!",
  "linked list": "🔗 **Linked List Fundamentals:**\n\n**Types:**\n• Singly Linked List → each node points to next\n• Doubly Linked List → points to next & prev\n• Circular Linked List → last node points to head\n\n**Key Operations:**\n• Insert at head: O(1)\n• Insert at tail: O(n) or O(1) with tail pointer\n• Delete: O(n)\n• Search: O(n)\n\n**Common Interview Questions:**\n1. Reverse a linked list\n2. Detect cycle (Floyd's algorithm)\n3. Merge two sorted lists\n4. Find middle element",
  "recursion": "🔄 **Recursion Made Simple:**\n\nEvery recursive function needs:\n1. **Base case** — When to stop\n2. **Recursive case** — Call itself with smaller input\n\n```\nint factorial(int n) {\n  if (n <= 1) return 1;       // base case\n  return n * factorial(n-1);   // recursive case\n}\n```\n\n**How to think recursively:**\n• Trust that the recursive call works\n• Focus on one step at a time\n• Draw the call stack on paper\n\n💡 Common patterns: Tree traversal, Backtracking, Divide & Conquer",
  "sort": "📊 **Sorting Algorithms Comparison:**\n\n| Algorithm | Time (Avg) | Space | Stable |\n|-----------|-----------|-------|--------|\n| Bubble | O(n²) | O(1) | ✅ |\n| Selection | O(n²) | O(1) | ❌ |\n| Insertion | O(n²) | O(1) | ✅ |\n| Merge | O(n log n) | O(n) | ✅ |\n| Quick | O(n log n) | O(log n) | ❌ |\n| Heap | O(n log n) | O(1) | ❌ |\n\n🎯 **Interview tip:** Know when to use which!",
  "tree": "🌳 **Tree Data Structure:**\n\n**Binary Tree Traversals:**\n• Inorder (L-Root-R): Gives sorted order in BST\n• Preorder (Root-L-R): Used to copy trees\n• Postorder (L-R-Root): Used to delete trees\n• Level order: BFS using queue\n\n**BST Properties:**\n• Left child < Parent < Right child\n• Search/Insert/Delete: O(h) where h = height\n• Balanced BST: h = O(log n)\n\n**Must-know:** AVL trees, Red-Black trees for interviews",
  "dynamic programming": "⚡ **Dynamic Programming (DP):**\n\n**Steps to solve any DP problem:**\n1. Identify overlapping subproblems\n2. Define the state (what changes?)\n3. Write the recurrence relation\n4. Choose: Top-down (memoization) or Bottom-up (tabulation)\n\n**Classic DP Problems:**\n• Fibonacci → O(n) with DP\n• 0/1 Knapsack\n• Longest Common Subsequence\n• Coin Change\n• Edit Distance\n\n💡 Start with top-down, then optimize to bottom-up!",
  "graph": "🕸️ **Graph Algorithms:**\n\n**Representations:**\n• Adjacency Matrix: O(V²) space\n• Adjacency List: O(V+E) space ✅\n\n**Must-know Algorithms:**\n1. **BFS** — Shortest path (unweighted)\n2. **DFS** — Cycle detection, topological sort\n3. **Dijkstra** — Shortest path (weighted)\n4. **Bellman-Ford** — Negative weights\n5. **Kruskal/Prim** — Minimum spanning tree\n\n🎯 Practice: Islands problems, shortest path, cycle detection",
  "string": "📝 **String Problems Guide:**\n\n**Key Techniques:**\n1. **Two Pointers** — Palindrome check\n2. **Sliding Window** — Longest substring problems\n3. **HashMap** — Character frequency\n4. **KMP/Rabin-Karp** — Pattern matching\n\n**Java String Tips:**\n• Strings are immutable → use StringBuilder\n• `.equals()` not `==` for comparison\n• `.charAt(i)` for access, `.substring()` for slice\n\n🔥 Top problems: Anagram check, longest palindromic substring, string compression",

  // Aptitude
  "aptitude": "🧮 **Aptitude Exam Tips:**\n\n**Key Topics to Master:**\n1. **Number System** — HCF, LCM, divisibility\n2. **Percentages & Profit/Loss**\n3. **Time & Work / Speed & Distance**\n4. **Probability & Permutations**\n5. **Logical Reasoning**\n\n**Speed Tricks:**\n• Learn Vedic math multiplications\n• Memorize squares up to 30\n• Use approximation for complex calculations\n• Practice 50 problems daily\n\n📈 Companies: TCS, Infosys, Wipro all test these!",
  "percentage": "📊 **Percentage Shortcuts:**\n\n**Key Formulas:**\n• X% of Y = Y% of X\n• Increase: New = Original × (1 + %/100)\n• Decrease: New = Original × (1 - %/100)\n• % Change = (Difference/Original) × 100\n\n**Tricks:**\n• 10% = divide by 10\n• 5% = half of 10%\n• 15% = 10% + 5%\n• 20% = divide by 5\n• 25% = divide by 4\n\n📝 **Example:** 35% of 240?\n→ 30% = 72, 5% = 12 → Answer = 84",
  "probability": "🎲 **Probability Essentials:**\n\n**P(Event) = Favorable / Total outcomes**\n\n**Key Rules:**\n• P(A or B) = P(A) + P(B) - P(A∩B)\n• P(A and B) = P(A) × P(B) [if independent]\n• P(not A) = 1 - P(A)\n\n**Common Problems:**\n1. Dice → Total outcomes = 6ⁿ\n2. Cards → Total = 52 (13×4 suits)\n3. Coins → Total = 2ⁿ\n\n💡 **Tip:** Draw tree diagrams for complex problems!",
  "time and work": "⏰ **Time & Work Shortcuts:**\n\n**Core Concept:** If A does work in 'a' days:\n→ A's 1 day work = 1/a\n\n**Combined work:**\n→ 1/a + 1/b = (a+b)/(a×b)\n→ Together they finish in: (a×b)/(a+b) days\n\n**LCM Method (Faster!):**\n1. Take LCM of given days\n2. Find efficiency of each worker\n3. Total work ÷ combined efficiency = answer\n\n**Example:** A in 10 days, B in 15 days, together?\n→ LCM = 30, A = 3/day, B = 2/day\n→ 30 ÷ 5 = **6 days** ✅",

  // English
  "english": "📚 **Common English Mistakes to Avoid:**\n\n**Grammar:**\n1. ❌ \"He don't\" → ✅ \"He doesn't\"\n2. ❌ \"Me and him went\" → ✅ \"He and I went\"\n3. ❌ \"More better\" → ✅ \"Better\"\n4. ❌ \"Could of\" → ✅ \"Could have\"\n\n**Vocabulary Boosters:**\n• Read 15 mins daily (news articles)\n• Learn 5 new words daily with context\n• Use Anki flashcards for retention\n\n**Communication Tips:**\n• STAR method for interviews\n• Avoid filler words (um, like, basically)\n• Practice tongue twisters for fluency",
  "tense": "⏳ **English Tenses Made Simple:**\n\n**Present:**\n• Simple: I write code\n• Continuous: I am writing code\n• Perfect: I have written code\n\n**Past:**\n• Simple: I wrote code\n• Continuous: I was writing code\n• Perfect: I had written code\n\n**Future:**\n• Simple: I will write code\n• Continuous: I will be writing code\n• Perfect: I will have written code\n\n💡 **Key Rule:** Don't mix tenses in the same sentence!",
  "vocabulary": "📖 **Power Words for Interviews:**\n\n**Action Verbs:**\n• Spearheaded, Orchestrated, Implemented\n• Streamlined, Optimized, Pioneered\n• Collaborated, Mentored, Facilitated\n\n**Technical Terms:**\n• Scalable, Robust, Modular\n• Agile, Sprint, Pipeline\n• Deploy, Iterate, Refactor\n\n**Daily Practice:**\n1. Read one article → note 5 new words\n2. Use each word in a sentence\n3. Review last week's words\n4. Teach someone → best retention!\n\n🎯 Goal: 50 new words per month",
  "interview": "🎤 **Interview Communication Tips:**\n\n**STAR Method for Answers:**\n• **S**ituation — Set the context\n• **T**ask — What was your role?\n• **A**ction — What did you do?\n• **R**esult — What was the outcome?\n\n**Body Language:**\n• Maintain eye contact (60-70%)\n• Sit upright, lean slightly forward\n• Use hand gestures naturally\n• Smile genuinely\n\n**Common Mistakes:**\n❌ Speaking too fast\n❌ Not asking questions back\n❌ Badmouthing previous employer\n❌ Saying \"I don't know\" without trying",

  // General coding
  "java": "☕ **Java Quick Reference:**\n\n**Data Types:** int, long, float, double, boolean, char, String\n\n**Collections Framework:**\n• ArrayList → Dynamic array\n• LinkedList → Doubly linked\n• HashMap → Key-value O(1)\n• HashSet → Unique elements\n• PriorityQueue → Min heap\n• Stack, Queue → LIFO/FIFO\n\n**OOP Pillars:**\n1. Encapsulation\n2. Inheritance\n3. Polymorphism\n4. Abstraction\n\n🔥 Java is #1 for placements. Master Collections!",
  "python": "🐍 **Python Essentials:**\n\n**Why Python for CP?**\n• Concise syntax\n• Built-in data structures\n• Powerful libraries\n\n**Key Features:**\n```python\n# List comprehension\nsquares = [x**2 for x in range(10)]\n\n# Dictionary\nd = {k: v for k, v in pairs}\n\n# Lambda\nsorted(arr, key=lambda x: x[1])\n```\n\n**Useful Libraries:**\n• collections (Counter, deque, defaultdict)\n• itertools (permutations, combinations)\n• heapq (priority queue)\n\n⚠️ Note: Python is slower for competitive programming",
  "react": "⚛️ **React Fundamentals:**\n\n**Core Concepts:**\n1. **Components** — Reusable UI blocks\n2. **Props** — Data passed parent→child\n3. **State** — Component's internal data\n4. **Hooks** — useState, useEffect, useRef\n\n**Best Practices:**\n• Keep components small & focused\n• Lift state up when shared\n• Use useCallback/useMemo wisely\n• Always provide key prop in lists\n\n**Project Ideas:**\n• Todo app → CRUD basics\n• Weather app → API calls\n• E-commerce → State management\n\n🚀 React + TypeScript = 💪",
  "sql": "🗄️ **SQL for Interviews:**\n\n**Essential Commands:**\n```sql\nSELECT * FROM users WHERE age > 25;\nINSERT INTO users VALUES (...);\nUPDATE users SET name='X' WHERE id=1;\nDELETE FROM users WHERE id=1;\n```\n\n**Key Concepts:**\n• JOINs: INNER, LEFT, RIGHT, FULL\n• GROUP BY + HAVING\n• Subqueries & CTEs\n• Indexes for performance\n• Normalization (1NF, 2NF, 3NF)\n\n**Top Interview Questions:**\n1. Find 2nd highest salary\n2. Duplicate rows\n3. Running totals\n4. Employee-Manager hierarchy",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  
  // Check for topic matches
  for (const [key, response] of Object.entries(topicResponses)) {
    if (lower.includes(key)) return response;
  }

  // Fallback contextual responses
  if (lower.includes("help") || lower.includes("how")) {
    return "🤔 I can help with:\n\n**💻 Coding & DSA:**\n• Arrays, Linked Lists, Trees, Graphs\n• Sorting, Searching, DP\n• Java, Python, React, SQL\n\n**🧮 Aptitude:**\n• Percentages, Probability\n• Time & Work, Speed & Distance\n• Logical Reasoning\n\n**📚 English & Communication:**\n• Grammar, Vocabulary, Tenses\n• Interview tips, STAR method\n\nJust ask your specific question! 🚀";
  }

  if (lower.includes("thank")) {
    return "😊 You're welcome! Keep learning, keep coding! 🚀\n\nFeel free to ask anything anytime. Your consistency is what matters most!";
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "👋 Hey there! I'm your **CodeNex AI Mentor**.\n\nI can help with:\n• 💻 DSA & Coding doubts\n• 🧮 Aptitude shortcuts\n• 📚 English & interview prep\n\nWhat topic would you like to explore?";
  }

  return "🤖 I'm here to help with your learning journey!\n\n**Try asking about:**\n• \"Explain recursion\"\n• \"Tips for aptitude exams\"\n• \"Common English mistakes\"\n• \"Java collections\"\n• \"Dynamic programming\"\n• \"Interview communication tips\"\n\nOr ask any specific coding/aptitude/English question! 💡";
}

const getCurrentProblemContext = () => {
  const data = localStorage.getItem("arena.currentProblem");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

function getOfflineFallback(input: string, activeProblem: any): string {
  const lower = input.toLowerCase();
  if (activeProblem) {
    if (lower.includes("hint")) {
      const hint = activeProblem.hints?.[0] || "Break the problem down into smaller subproblems. Think about the base cases first.";
      return `💡 **AI Mentor Hint for "${activeProblem.title}":**\n\n${hint}\n\n*Try to trace the logic with a small input!*`;
    }
    if (lower.includes("explain") || lower.includes("dry run") || lower.includes("walkthrough")) {
      const explanation = activeProblem.explanation || "Let's trace the execution on Example 1. Track the variables step-by-step to see how they evolve.";
      return `🔄 **Explanation & Walkthrough for "${activeProblem.title}":**\n\n${explanation}`;
    }
    if (lower.includes("complexity") || lower.includes("big o") || lower.includes("time") || lower.includes("space")) {
      return `⏱️ **Complexity Analysis for "${activeProblem.title}":**\n\nFor this problem, the optimal targets are:\n• **Time Complexity:** O(N) linear time\n• **Space Complexity:** O(N) or O(1) auxiliary space\n\nCan you think of a way to achieve this using a Hash Map or Two Pointers?`;
    }
    if (lower.includes("solution") || lower.includes("code") || lower.includes("reveal")) {
      const sol = activeProblem.solutions?.javascript || activeProblem.starterCode?.javascript || "// Solution under construction.";
      return `🔑 **Reference Solution for "${activeProblem.title}":**\n\nHere is the Javascript implementation:\n\`\`\`javascript\n${sol}\n\`\`\``;
    }
  }
  return getResponse(input);
}

const AIChatButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi! I'm your **CodeNex AI Mentor**.\n\nAsk me about DSA, coding, aptitude, or English — I'll help you ace it! 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const activeProblem = getCurrentProblemContext();
      let historyToSend = [...messages, userMsg];

      if (activeProblem) {
        // Prepend context to help Gemini understand the problem
        const contextMsg = {
          role: "user" as const,
          content: `SYSTEM INSTRUCTION: You are an encouraging AI Coding Mentor on CodeNex. The user is currently viewing the problem: "${activeProblem.title}" (Difficulty: ${activeProblem.difficulty}).\nDescription: ${activeProblem.description}\nConstraints: ${activeProblem.constraints?.join(", ") || "None"}\nExamples: ${JSON.stringify(activeProblem.examples || [])}\nTarget Complexity: ${activeProblem.timeComplexity || "optimized"}.\n\nRules:\n1. The user might ask for hints, explanations, complexity analysis, dry runs, debugging guidance, or concepts.\n2. Do NOT reveal the full solution code unless the user explicitly requests it.\n3. Keep responses structured and educational.`
        };
        const ackMsg = {
          role: "assistant" as const,
          content: `Understood! I am now acting as the AI Mentor for the problem "${activeProblem.title}". I will provide hints, explanations, complexities, dry runs, and guidance without revealing the full solution code unless explicitly requested.`
        };
        historyToSend = [contextMsg, ackMsg, ...historyToSend];
      }

      const res = await api.post("/chatbot/chat", { messages: historyToSend });
      if (res.data && res.data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
      } else {
        const reply = getOfflineFallback(text, activeProblem);
        setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      const activeProblem = getCurrentProblemContext();
      const reply = getOfflineFallback(text, activeProblem);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      setOpen(true);
      if (custom.detail?.prompt) {
        send(custom.detail.prompt);
      }
    };
    window.addEventListener("open-ai-mentor", handler);
    return () => window.removeEventListener("open-ai-mentor", handler);
  }, [messages, loading]);

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center neon-glow-purple cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2 } }}
      >
        {open ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] glass-strong rounded-2xl flex flex-col overflow-hidden neon-glow-purple"
          >
            {/* Header */}
            <div className="p-4 border-b border-border gradient-primary">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground text-sm">CodeNex AI Mentor</h3>
                  <p className="text-[10px] text-primary-foreground/70">DSA • Aptitude • English • Interview Prep</p>
                </div>
              </div>
              {/* Topic pills */}
              <div className="flex gap-1.5 mt-3">
                {[
                  { icon: Code2, label: "Coding" },
                  { icon: Brain, label: "Aptitude" },
                  { icon: BookOpen, label: "English" },
                  { icon: Lightbulb, label: "Tips" },
                ].map(t => (
                  <span key={t.label} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/15 text-primary-foreground">
                    <t.icon className="w-3 h-3" />{t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/60 text-foreground rounded-bl-sm"
                  }`}>
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <Markdown content={msg.content} />
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-muted-foreground text-xs p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {getCurrentProblemContext() ? (
                  <>
                    <button
                      onClick={() => send("Give me a hint")}
                      className="text-[10px] px-2.5 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-colors cursor-pointer"
                    >
                      💡 Get a Hint
                    </button>
                    <button
                      onClick={() => send("Explain the dry run walkthrough")}
                      className="text-[10px] px-2.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors cursor-pointer"
                    >
                      🔄 Dry Run
                    </button>
                    <button
                      onClick={() => send("What is the optimal complexity?")}
                      className="text-[10px] px-2.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors cursor-pointer"
                    >
                      ⏱️ Complexity
                    </button>
                  </>
                ) : (
                  quickReplies.map(qr => (
                    <button
                      key={qr}
                      onClick={() => send(qr)}
                      className="text-[11px] px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Ask any doubt..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(input)}
                className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatButton;
