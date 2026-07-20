const axios = require("axios");

const SYSTEM_INSTRUCTION = `You are CodeNex AI, an advanced AI Coding & Career Mentor built into the CodeNex platform.
You specialize in:
1. Coding Assistance (Java, Python, C++, JS, TS, React, Node, SQL)
2. DSA Guidance & Problem Solving Strategies
3. Debugging & Error Resolution
4. Code Optimization & Complexity Reduction (Big O)
5. Project Architecture & Full-Stack Guidance
6. Aptitude & Logical Reasoning Shortcuts
7. English Communication & Professional Writing
8. Resume Review & ATS Optimization
9. HR & Technical Interview Preparation
10. Career Roadmaps for Software Engineers

Formatting Rules:
- Use clear markdown formatting.
- Format all code snippets in fenced code blocks with language identifiers (e.g. \`\`\`javascript or \`\`\`python).
- Provide structured, step-by-step explanations.
- Be encouraging, highly technical, concise, and professional.`;

// Offline Contextual Intelligence Fallback Engine
function generateFallbackResponse(userPrompt, conversationContext = []) {
  const input = userPrompt.toLowerCase();

  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return `👋 Hello! I am **CodeNex AI**, your dedicated AI Coding & Career Mentor.

How can I help you today?
• 💻 **Coding & DSA** (Data Structures, Algorithms, Debugging)
• 🧮 **Aptitude & Math** (Shortcuts & Exam Prep)
• 🗣️ **English & Communication** (Grammar, Pronunciation, Professional Email)
• 📄 **Resume & Interview** (STAR Method, Mock Interview, Career Roadmaps)`;
  }

  if (input.includes("dsa") || input.includes("array") || input.includes("tree") || input.includes("graph") || input.includes("dp")) {
    return `🌲 **CodeNex AI — Data Structures & Algorithms Guidance**

Key strategy for DSA problem solving:
1. **Understand Constraints:** Identify $N$ to determine allowable time complexity ($O(N)$, $O(N \\log N)$, $O(N^2)$).
2. **Choose Optimal Data Structure:**
   - Fast lookup $\\rightarrow$ \`HashMap\` / \`HashSet\` ($O(1)$)
   - Order & Extremes $\\rightarrow$ \`PriorityQueue\` / \`Heap\` ($O(\\log N)$)
   - Contiguous Subarray $\\rightarrow$ Sliding Window / Two Pointers
3. **Dry Run on Edge Cases:** Test empty inputs, single element, negative numbers, duplicates.

\`\`\`javascript
// Example: Two Pointer Technique for Sorted Arrays
function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [];
}
\`\`\`

Would you like a step-by-step hint or complexity breakdown for a specific problem?`;
  }

  if (input.includes("debug") || input.includes("error") || input.includes("fix")) {
    return `🐛 **CodeNex AI — Code Debugging Protocol**

To fix errors effectively:
1. **Identify Exception & Line:** Check the stack trace top line for exact file and line number.
2. **Print / Log Intermediate Variables:** Log values right before the failure point.
3. **Verify Bounds & Null Checks:** Ensure arrays are indexed within bounds and objects are initialized.

If you paste your code snippet or error message here, I will diagnose the bug and output the corrected code!`;
  }

  if (input.includes("resume") || input.includes("cv") || input.includes("interview")) {
    return `📄 **CodeNex AI — Resume & Tech Interview Strategy**

**Resume Best Practices:**
- Use **STAR Method** (Situation, Task, Action, Result) for project bullet points.
- Quantify impacts: *"Optimized database queries, reducing API response time by 45%"*.
- Include relevant keywords for ATS compliance (React, Node, Java, Docker, REST APIs).

**Technical Interview Checklist:**
- Communicate your thought process out loud before coding.
- State time & space complexity upfront ($O(N)$ time, $O(1)$ space).
- Write clean modular code with self-explanatory variable names.`;
  }

  return `🚀 **CodeNex AI Mentor Response**

Thank you for your question! As **CodeNex AI**, I am fully equipped to assist with your coding, DSA, aptitude, English communication, or career queries.

\`\`\`javascript
// CodeNex AI Quick Action Tip
console.log("Consistency + Structured Practice = Software Engineering Mastery");
\`\`\`

Feel free to ask a specific coding question, paste code to debug, or upload a project file for analysis!`;
}

// Call Google Gemini API
async function callGemini(messages, prompt, apiKey) {
  try {
    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== prompt) {
      contents.push({ role: "user", parts: [{ text: prompt }] });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) return reply;
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
  }
  return null;
}

// Call OpenAI API
async function callOpenAI(messages, prompt, apiKey) {
  try {
    const formatted = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: formatted,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
    );

    return response.data?.choices?.[0]?.message?.content;
  } catch (err) {
    console.error("OpenAI API error:", err.message);
  }
  return null;
}

// Call Anthropic Claude API
async function callClaude(messages, prompt, apiKey) {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 1500,
        system: SYSTEM_INSTRUCTION,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        timeout: 15000,
      }
    );

    return response.data?.content?.[0]?.text;
  } catch (err) {
    console.error("Claude API error:", err.message);
  }
  return null;
}

// Main AI Provider Dispatcher
async function generateAIResponse({ prompt, messages = [], attachmentContext = "" }) {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;
  const claudeKey = process.env.CLAUDE_API_KEY;

  let fullPrompt = prompt;
  if (attachmentContext) {
    fullPrompt = `[Attached Document Context:\n${attachmentContext}\n]\n\nUser Question: ${prompt}`;
  }

  const history = [...messages];
  if (history.length === 0 || history[history.length - 1].content !== fullPrompt) {
    history.push({ role: "user", content: fullPrompt });
  }

  let reply = null;

  if (provider === "gemini" && geminiKey) {
    reply = await callGemini(history, fullPrompt, geminiKey);
  } else if (provider === "openai" && openAIKey) {
    reply = await callOpenAI(history, fullPrompt, openAIKey);
  } else if (provider === "claude" && claudeKey) {
    reply = await callClaude(history, fullPrompt, claudeKey);
  } else {
    // Try Gemini fallback if key is available
    if (geminiKey) reply = await callGemini(history, fullPrompt, geminiKey);
    else if (openAIKey) reply = await callOpenAI(history, fullPrompt, openAIKey);
  }

  if (reply) return reply;

  // Contextual offline fallback if no API key or external service timeout
  return generateFallbackResponse(prompt, messages);
}

module.exports = {
  generateAIResponse,
  SYSTEM_INSTRUCTION,
};
