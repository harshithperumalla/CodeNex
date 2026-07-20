import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Bookmark, BookmarkCheck,
  Lightbulb, Bot, Sparkles, Trophy, Flame, Star, Target, Zap, ChevronRight, X,
  ExternalLink, Code2, Brain, Loader2, Play, BookOpen, MessageSquare, ThumbsUp, Building2, RefreshCw
} from "lucide-react";
import DiscussionTab from "@/components/coding/DiscussionTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { problems } from "@/data/problems";

// Particles confetti effect
const Particles = () => (
  <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    {Array.from({ length: 28 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 1, x: "50vw", y: "50vh", scale: 0 }}
        animate={{
          opacity: 0,
          x: `${Math.random() * 100}vw`,
          y: `${Math.random() * 100}vh`,
          scale: Math.random() * 1.5 + 0.5,
        }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute w-2 h-2 rounded-full"
        style={{ background: ["#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"][i % 4], boxShadow: "0 0 12px currentColor" }}
      />
    ))}
  </div>
);

// Offline dynamic simulator for AI Mentor Chatbot response
const getCodingWorkspaceOfflineFallback = (text: string, prob: any): string => {
  const lower = text.toLowerCase();
  if (prob) {
    if (lower.includes("hint")) {
      const hint = prob.hints?.[0] || "Break the problem down into smaller subproblems. Think about the base cases first.";
      return `💡 **AI Mentor Hint for "${prob.title}":**\n\n${hint}\n\n*Try to think about the optimal data structure to use!*`;
    }
    if (lower.includes("concept") || lower.includes("related concept")) {
      const conceptsList = prob.concepts?.join(", ") || prob.tags?.join(", ") || "Data Structures and Algorithms";
      return `🌳 **Core Concepts for "${prob.title}":**\n\nThe main concepts tested in this challenge are: **${conceptsList}**.\n\n*Understanding these will help you design the optimal solution!*`;
    }
    if (lower.includes("dry run") || lower.includes("walkthrough") || lower.includes("trace")) {
      const explanation = prob.explanation || "Let's trace the execution on Example 1. Track the variables step-by-step to see how they evolve.";
      const diagram = prob.diagram ? `\n\nHere is a visual dry run:\n\`\`\`\n${prob.diagram}\n\`\`\`` : "";
      return `🔄 **Explanation & Dry Run Walkthrough for "${prob.title}":**\n\n${explanation}${diagram}`;
    }
    if (lower.includes("complexity") || lower.includes("big o") || lower.includes("time") || lower.includes("space")) {
      const comp = prob.complexity || "Time: O(N), Space: O(N)";
      return `⏱️ **Complexity Explanation for "${prob.title}":**\n\nFor this problem, the optimal targets are:\n• **Optimal Complexity:** ${comp}\n\nCan you think of a way to achieve this using standard algorithms?`;
    }
    if (lower.includes("debug") || lower.includes("guidance")) {
      return `🐛 **Debugging Guidance for "${prob.title}":**\n\nWhen debugging, pay close attention to:\n1. **Edge cases:** empty inputs, single element inputs, or negative values.\n2. **Out of bounds errors:** check loop indices carefully.\n3. **Termination conditions:** ensure base cases in recursion are met.`;
    }
    if (lower.includes("solution") || lower.includes("code") || lower.includes("reveal")) {
      const sol = prob.solutions?.javascript || prob.starterCode?.javascript || "// Solution under construction.";
      return `🔑 **Reference Solution for "${prob.title}":**\n\nHere is the JavaScript implementation:\n\`\`\`javascript\n${sol}\n\`\`\``;
    }
  }
  return "🤖 I'm here to support your learning journey! Try asking for a hint, dry run, complexity explanation, or debugging guidance.";
};

const diffStyles: Record<string, { text: string; bg: string; ring: string; glow: string }> = {
  Beginner: { text: "text-sky-300",     bg: "bg-sky-500/10",      ring: "ring-sky-400/40",     glow: "shadow-[0_0_20px_rgba(56,189,248,0.3)]" },
  Easy:     { text: "text-emerald-300", bg: "bg-emerald-500/10",  ring: "ring-emerald-400/40", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]" },
  Medium:   { text: "text-amber-300",   bg: "bg-amber-500/10",    ring: "ring-amber-400/40",   glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]" },
  Hard:     { text: "text-rose-300",    bg: "bg-rose-500/10",     ring: "ring-rose-400/40",    glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]" },
  Expert:   { text: "text-fuchsia-300",  bg: "bg-fuchsia-500/10",   ring: "ring-fuchsia-400/40",  glow: "shadow-[0_0_20px_rgba(217,70,239,0.3)]" },
};

const CodingWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProblem = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/coding/problems/${id}`);
      if (res.data && res.data.success && res.data.problem) {
        setProblem(res.data.problem);
      } else {
        throw new Error("Failed to load problem");
      }
    } catch (err) {
      console.warn("Failed to fetch problem details from backend, loading fallback static problem:", err);
      const numId = Number(id);
      const strId = String(id).toLowerCase();
      const staticP = problems.find(
        (p) =>
          (!isNaN(numId) && p.id === numId) ||
          p.title.toLowerCase() === strId ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === strId
      );
      if (staticP) {
        setProblem(staticP);
      } else {
        setProblem(problems[0] || null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id]);

  const { user, setUser } = useUser();
  const streak = user?.streak || 0;
  const xp = user?.points || 0;

  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => {
    if (problem) {
      const bm = JSON.parse(localStorage.getItem("bookmarkedProblems") || "[]");
      setBookmarked(bm.includes(problem.id));
    }
  }, [problem]);

  const toggleBookmark = () => {
    if (!problem) return;
    const bm: number[] = JSON.parse(localStorage.getItem("bookmarkedProblems") || "[]");
    const next = bookmarked ? bm.filter(x => x !== problem.id) : [...bm, problem.id];
    localStorage.setItem("bookmarkedProblems", JSON.stringify(next));
    setBookmarked(!bookmarked);
    if (!bookmarked) {
      toast.success("Problem bookmarked successfully!");
    } else {
      toast("Bookmark removed");
    }
  };

  // External Verification Inputs
  const [platform, setPlatform] = useState("leetcode");
  const [extUsername, setExtUsername] = useState("");
  const [extLink, setExtLink] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);

  // Rewards & Visual triggers
  const [showReward, setShowReward] = useState(false);
  const [particles, setParticles] = useState(false);

  // Reference Solution tab
  const [solLang, setSolLang] = useState("javascript");

  // AI Mentor state
  const [aiOpen, setAiOpen] = useState(true);
  const [aiMessages, setAiMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hey! I'm your AI Mentor 🤖. Let me help you with hints, concepts, dry runs, complexity, debugging, or related topics. Ask me anything!" }
  ]);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !problem) return;
    const newMsg = { role: "user" as const, text };
    setAiMessages(prev => [...prev, newMsg]);
    setAiThinking(true);
    setAiInput("");

    // Create a context prompt to make sure the model has context of the current problem
    const contextPrompt = `
You are an expert AI Coding Mentor at CodeNex.
The user is currently studying the problem: "${problem.title}" (Difficulty: ${problem.difficulty}, Category: ${problem.category || "DSA"}).
Description: ${problem.description}
Constraints: ${problem.constraints?.join(", ")}
Complexity targets: ${problem.complexity || "Optimal"}

Instruction: Offer guidance on: Hints, Concept explanation, Dry run walkthrough, Complexity, Debug advice, or Related concepts. Do NOT reveal the complete solution code unless the user explicitly requests it. Keep it educational and step-by-step.
`;

    const formattedHistory = [
      { role: "system", content: contextPrompt },
      ...aiMessages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      }))
    ];

    try {
      const res = await api.post("/chatbot/chat", {
        message: text,
        history: formattedHistory
      });
      if (res.data.success && res.data.response) {
        setAiMessages(prev => [...prev, { role: "ai", text: res.data.response }]);
      } else {
        throw new Error("Chatbot API returned failure");
      }
    } catch (err) {
      console.warn("Real chatbot backend unavailable. Falling back to offline simulator.");
      await new Promise(r => setTimeout(r, 600));
      const fallbackReply = getCodingWorkspaceOfflineFallback(text, problem);
      setAiMessages(prev => [...prev, { role: "ai", text: fallbackReply }]);
    } finally {
      setAiThinking(false);
    }
  };

  const handleQuickConnect = async () => {
    if (!extUsername.trim()) {
      toast.error("Please enter your LeetCode username");
      return;
    }
    setVerifying(true);
    try {
      const res = await api.post("/user/leetcode-connect", { username: extUsername.trim() });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(`Connected to LeetCode as @${extUsername.trim()}!`);
        setExtUsername("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to connect LeetCode account.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSyncLeetCode = async () => {
    setVerifying(true);
    try {
      const res = await api.post("/user/leetcode-sync");
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(res.data.message || "LeetCode progress synced!");
        if (res.data.newSolvedCount > 0) {
          setShowReward(true);
          setParticles(true);
          setTimeout(() => setParticles(false), 1500);
          setTimeout(() => setShowReward(false), 3500);
        }
      }
    } catch (err) {
      toast.error("Failed to sync LeetCode progress.");
    } finally {
      setVerifying(false);
    }
  };

  const handleManualVerifyFallback = async () => {
    if (!problem) return;
    setVerifying(true);
    try {
      const res = await api.post(`/coding/problems/${problem.id}/verify-external`, {
        platform: "leetcode",
        username: user?.leetcodeUsername || user?.fullName || "Developer",
        submissionLink: problem.leetcodeLink || `https://leetcode.com/problems/${problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
      });
      if (res.data.success) {
        toast.success(`🎉 "${problem.title}" marked as solved on CodeNex!`);
        if (res.data.user) {
          setUser(res.data.user);
        }
        setProblem((prev: any) => (prev ? { ...prev, solved: true } : null));
        setShowReward(true);
        setParticles(true);
        setTimeout(() => setParticles(false), 1500);
        setTimeout(() => setShowReward(false), 3500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  // Find related problems sharing at least one tag
  const relatedProblems = useMemo(() => {
    if (!problem || !problem.tags || !Array.isArray(problem.tags)) return [];
    const currentTags = new Set(problem.tags);
    return problems
      .filter((p) => p.id !== problem.id && (p.tags || []).some((t) => currentTags.has(t)))
      .slice(0, 3);
  }, [problem]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <h2 className="text-xl font-semibold text-white">Loading problem details...</h2>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Problem not found</h2>
          <Button onClick={() => navigate("/coding")} className="bg-primary hover:bg-primary/80">Back to Problems</Button>
        </div>
      </div>
    );
  }

  const s = diffStyles[problem.difficulty] || diffStyles.Easy;
  const isSolved = problem.solved;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col -m-6 relative bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background radial effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {particles && <Particles />}

      {/* Trophy Reward Popup */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-8 py-5 rounded-2xl bg-gradient-to-br from-purple-600/90 via-blue-600/90 to-emerald-500/90 backdrop-blur-xl border border-white/20 shadow-2xl text-center">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6 }}>
                <Trophy className="w-10 h-10 text-yellow-300 mx-auto mb-1 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
              </motion.div>
              <p className="text-white font-bold text-lg">Verification Successful!</p>
              <p className="text-white/95 text-sm mt-1">+{problem.points} XP &nbsp;•&nbsp; 🔥 Streak +1</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Actions Strip */}
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coding")} className="p-1.5 rounded-lg hover:bg-white/10 transition-all hover:scale-115">
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </button>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-semibold text-orange-300">{streak} Day Streak</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-300">XP: {xp.toLocaleString()}</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          {isSolved && (
            <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Solved & Verified
            </span>
          )}
          <button onClick={toggleBookmark} className="p-1.5 rounded-lg hover:bg-white/10 transition-all hover:scale-115">
            {bookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-300" /> : <Bookmark className="w-4 h-4 text-white/50" />}
          </button>
          <button
            onClick={() => setAiOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              aiOpen
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> AI Mentor Chat
          </button>
        </div>
      </motion.div>

      {/* Main Dual Columns Layout */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Column - Problem Specifications */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0 border-r border-white/10 bg-slate-950/20">
          
          {/* Header Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase bg-purple-500/15 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                Challenge #{problem.id}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${s.bg} ${s.text} ${s.glow}`}>
                {problem.difficulty}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-yellow-400/90 font-bold bg-yellow-500/5 px-2.5 py-0.5 rounded-full border border-yellow-500/10">
                <Target className="w-3.5 h-3.5" /> +{problem.points} XP Reward
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              {problem.title}
            </h1>
            
            <div className="flex flex-wrap gap-1.5">
              {problem.tags?.map((t: string) => (
                <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1 font-medium">
                  <Code2 className="w-3 h-3 text-cyan-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Description Section */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-cyan-400" /> Problem Statement
            </h4>
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {problem.description}
            </div>
          </div>

          {/* Input Format, Output Format & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Input Format</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {problem.inputFormat || "Standard input corresponding to parameter signatures."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Output Format</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {problem.outputFormat || "Standard output matching expected criteria."}
              </p>
            </div>
          </div>

          {/* Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Examples & Scenarios</h4>
              {problem.examples.map((ex: any, i: number) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs space-y-1.5">
                  <div className="text-slate-400"><span className="text-violet-300 font-semibold">Example {i + 1} Input:</span> {ex.input}</div>
                  <div className="text-slate-400"><span className="text-cyan-300 font-semibold">Output:</span> {ex.output}</div>
                  {ex.explanation && (
                    <div className="text-slate-500 pt-1.5 border-t border-white/5 leading-relaxed">
                      <span className="text-amber-400 font-semibold">Explanation:</span> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Explanation & Notes Section */}
          {problem.explanation && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 shadow-lg">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-amber-400" /> Explanation & Concept Notes
              </h4>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {problem.explanation}
              </div>
            </div>
          )}

          {/* Diagram & Dry Run */}
          {problem.diagram && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-purple-400" /> Dry Run & Visualization
              </h4>
              <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre">
                {problem.diagram}
              </pre>
            </div>
          )}

          {/* Sample Test Cases Overview */}
          {problem.testCases && problem.testCases.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Test Cases ({problem.testCases.length} Verified Cases)
              </h4>
              <div className="space-y-2">
                {problem.testCases.map((tc: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] flex justify-between items-center">
                    <span className="text-slate-400">Test #{idx + 1} Input: <code className="text-slate-200">{tc.input}</code></span>
                    <span className="text-cyan-400 font-semibold">Expected: {tc.expectedOutput}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints Card */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Constraints & Limits</h4>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
                {problem.constraints.map((c: string, i: number) => (
                  <li key={i}><code>{c}</code></li>
                ))}
              </ul>
            </div>
          )}

          {/* Companies List */}
          {problem.companies && problem.companies.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-white/50 pt-2 bg-white/[0.01] border border-white/5 p-3 rounded-xl">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">Featured In Interviews:</span>
              <span className="text-slate-400">{problem.companies.join(" • ")}</span>
            </div>
          )}

          {/* Related Challenges */}
          {relatedProblems && relatedProblems.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-cyan-400" /> Related Problems
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {relatedProblems.map((rp: any) => (
                  <button
                    key={rp.id}
                    onClick={() => navigate(`/coding/${rp.id}`)}
                    className="p-3 rounded-xl bg-black/30 hover:bg-white/5 border border-white/10 text-left flex items-center justify-between transition-all group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">{rp.title}</p>
                      <span className="text-[10px] text-slate-400">{rp.difficulty} • {rp.tags?.[0]}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="border-white/10" />

          {/* Discussion */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.01] overflow-hidden">
            <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Community Discussion Board</h3>
            </div>
            <DiscussionTab problemId={problem.id} />
          </div>

        </div>

        {/* Right Column - Actions, AI Mentor & Verification */}
        <div className="w-[30%] min-w-[320px] max-w-[420px] flex flex-col overflow-y-auto p-6 space-y-5 border-l border-white/10 bg-slate-950/40">
          
          {/* Official Open in LeetCode Button */}
          <a
            href={problem.leetcodeLink || `https://leetcode.com/problems/${problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all duration-300 text-sm"
          >
            <ExternalLink className="w-4.5 h-4.5" /> Open in LeetCode
          </a>

          {/* LeetCode Sync & Account Integration Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Code2 className="w-4 h-4 text-amber-400" /> LeetCode Account
              </h4>
              {user?.isLeetCodeConnected ? (
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Connected
                </span>
              ) : (
                <span className="text-[10px] text-white/40 font-medium">Not Connected</span>
              )}
            </div>

            {user?.isLeetCodeConnected ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">
                      @{user.leetcodeUsername.replace(/^@/, '')}
                    </span>
                    {user.leetcodeLastSyncedAt && (
                      <span className="text-[10px] text-white/40 block mt-0.5 font-mono">
                        Last synced: {new Date(user.leetcodeLastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://leetcode.com/u/${user.leetcodeUsername.replace(/^@/, '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open LeetCode Profile"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center justify-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Button
                      size="sm"
                      onClick={handleSyncLeetCode}
                      disabled={verifying}
                      className="gradient-primary text-primary-foreground text-xs h-8 px-3 gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} /> Sync Now
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-white/60">LeetCode Solved Status:</span>
                  {isSolved ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Not Synced Yet</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-white/60 leading-relaxed">
                  Link your LeetCode account once to automatically sync solved challenges across CodeNex:
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Username (e.g. harshithperumalla)"
                    value={extUsername}
                    onChange={(e) => setExtUsername(e.target.value)}
                    disabled={verifying}
                    className="bg-black/30 border-white/10 text-xs h-8.5 text-white"
                  />
                  <Button
                    onClick={handleQuickConnect}
                    disabled={verifying || !extUsername.trim()}
                    className="gradient-primary text-primary-foreground text-xs h-8.5 px-3 font-semibold shrink-0"
                  >
                    Connect LeetCode
                  </Button>
                </div>
              </div>
            )}

            {/* 1-Click Verification Fallback */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <p className="text-[11px] text-white/50 leading-normal">
                Can't verify automatically? Click below to mark as solved on CodeNex:
              </p>
              <Button
                onClick={handleManualVerifyFallback}
                disabled={verifying || isSolved}
                className="w-full text-xs h-8.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium flex items-center justify-center gap-1.5 rounded-lg"
              >
                {isSolved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Solved on CodeNex
                  </>
                ) : (
                  <>Mark as Solved on CodeNex</>
                )}
              </Button>
            </div>
          </div>

          {/* Reference Solutions */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" /> Reference Solutions
              </h4>
              <select
                value={solLang}
                onChange={e => setSolLang(e.target.value)}
                className="bg-black/50 border border-white/10 text-[11px] text-slate-300 rounded px-1.5 py-0.5"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            {problem.solutions?.[solLang] || problem.starterCode?.[solLang] ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Time Complexity: {problem.complexity || "Optimal"}</span>
                </div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/5 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed max-h-48">
                  {problem.solutions?.[solLang] || problem.starterCode?.[solLang]}
                </pre>
              </div>
            ) : (
              <p className="text-xs text-white/40">No reference solution seeded for this language.</p>
            )}
          </div>

          {/* AI Mentor Chatbot Panel */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-purple-500/5 via-slate-900/40 to-blue-500/5 overflow-hidden flex flex-col h-[320px]">
            <div className="bg-white/5 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">AI Mentor Companion</span>
              </div>
              <span className="text-[10px] text-purple-300">Online</span>
            </div>

            {/* Quick Prompts Grid */}
            <div className="grid grid-cols-2 gap-1 p-2 bg-white/[0.02] border-b border-white/5">
              <button
                type="button"
                onClick={() => sendMessage(`Give me a hint for "${problem.title}"`)}
                className="py-1 rounded bg-white/5 hover:bg-purple-500/10 text-[9px] text-slate-300 flex items-center justify-center gap-1 border border-white/5"
              >
                <Lightbulb className="w-2.5 h-2.5 text-yellow-400" /> Hints
              </button>
              <button
                type="button"
                onClick={() => sendMessage(`Explain the dry run walkthrough for "${problem.title}"`)}
                className="py-1 rounded bg-white/5 hover:bg-purple-500/10 text-[9px] text-slate-300 flex items-center justify-center gap-1 border border-white/5"
              >
                <Play className="w-2.5 h-2.5 text-cyan-400" /> Dry Run
              </button>
              <button
                type="button"
                onClick={() => sendMessage(`Explain the complexity for "${problem.title}"`)}
                className="py-1 rounded bg-white/5 hover:bg-purple-500/10 text-[9px] text-slate-300 flex items-center justify-center gap-1 border border-white/5"
              >
                <Clock className="w-2.5 h-2.5 text-amber-400" /> Complexity
              </button>
              <button
                type="button"
                onClick={() => sendMessage(`Explain the related concepts for "${problem.title}"`)}
                className="py-1 rounded bg-white/5 hover:bg-purple-500/10 text-[9px] text-slate-300 flex items-center justify-center gap-1 border border-white/5"
              >
                <Brain className="w-2.5 h-2.5 text-purple-400" /> Concepts
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {aiMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] px-3 py-1.5 rounded-2xl text-[11px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white/5 border border-white/5 text-slate-200 rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiThinking && (
                <div className="flex gap-1 p-2 bg-white/5 rounded-2xl w-fit">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(aiInput);
              }}
              className="p-2 border-t border-white/5 flex gap-1 bg-black/20"
            >
              <input
                type="text"
                placeholder="Ask AI Mentor..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                disabled={aiThinking}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
              />
              <button
                type="submit"
                disabled={aiThinking || !aiInput.trim()}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>

          {/* Related Problems */}
          {relatedProblems.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Related Problems</h4>
              <div className="space-y-2">
                {relatedProblems.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/coding/${p.id}`)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">#{p.id}</div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{p.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

class WorkspaceErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("CodingWorkspace Error Boundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Something went wrong loading this problem</h2>
          <p className="text-xs text-slate-400 max-w-md">{this.state.error || "An error occurred while rendering problem details."}</p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()} className="bg-primary text-xs">
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/coding"} className="text-xs">
              Back to Problems
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const CodingWorkspaceWithErrorBoundary = (props: any) => (
  <WorkspaceErrorBoundary>
    <CodingWorkspace {...props} />
  </WorkspaceErrorBoundary>
);

export default CodingWorkspaceWithErrorBoundary;
