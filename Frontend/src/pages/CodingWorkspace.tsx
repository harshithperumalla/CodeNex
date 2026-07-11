import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { problems } from "@/data/problems";
import {
  ArrowLeft, Play, Send, CheckCircle2, XCircle, Clock, RotateCcw,
  Bookmark, BookmarkCheck, Lightbulb, Bot, Sparkles, Bug, Briefcase,
  Trophy, Flame, Star, Target, Zap, Gauge, ChevronRight, X, Wand2,
} from "lucide-react";
import DiscussionTab from "@/components/coding/DiscussionTab";
import AIHintPanel from "@/components/coding/AIHintPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

const diffColor: Record<string, string> = {
  Easy: "text-neon-green",
  Medium: "text-neon-yellow",
  Hard: "text-neon-pink",
};
const diffBg: Record<string, string> = {
  Easy: "bg-neon-green/10 border border-neon-green/30",
  Medium: "bg-neon-yellow/10 border border-neon-yellow/30",
  Hard: "bg-neon-pink/10 border border-neon-pink/30",
};
const xpForDiff = { Easy: 50, Medium: 120, Hard: 250 } as const;

type SubmissionResult = {
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | null;
  runtime?: string;
  memory?: string;
  testCasesPassed?: number;
  totalTestCases?: number;
  output?: string;
};

const monacoLangMap: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

// Real-world scenario template per category
const realWorldScenario = (problem: any) => {
  const company = problem.companies?.[0] || "Acme Corp";
  const map: Record<string, { title: string; ticket: string; context: string }> = {
    Easy: {
      title: `🐛 Fix the slow user lookup endpoint`,
      ticket: `JIRA-${1200 + problem.id}`,
      context: `Production alert: the /api/users lookup is timing out under load. The current implementation is O(n²). Refactor it using the same pattern as "${problem.title}" so it runs in linear time.`,
    },
    Medium: {
      title: `⚡ Optimize the search query causing 500ms latency`,
      ticket: `JIRA-${1200 + problem.id}`,
      context: `${company}'s analytics team noticed our backend service is hitting timeouts. Apply the technique from "${problem.title}" to reduce query complexity and ship before EOD.`,
    },
    Hard: {
      title: `🚀 Build a scalable service handling 1M req/min`,
      ticket: `JIRA-${1200 + problem.id}`,
      context: `Tech lead at ${company} flagged a scaling bottleneck. We need an algorithm inspired by "${problem.title}" to reduce memory pressure and CPU usage in production.`,
    },
  };
  return map[problem.difficulty];
};

const buggyCodeFor = (problem: any, lang: string) => {
  const starter = problem.starterCode[lang] || "";
  // Inject some "bugs" via simple comments + broken patterns
  if (lang === "javascript") {
    return `// 🐛 Buggy implementation — fix the logic\nfunction ${problem.title.replace(/\s/g, "").toLowerCase()}(nums, target) {\n  for (let i = 0; i <= nums.length; i++) {     // off-by-one\n    for (let j = 0; i < nums.length; j++) {    // wrong condition\n      if (nums[i] + nums[j] = target) {        // assignment vs equality\n        return [i, j];\n      }\n    }\n  }\n  return null;                                  // should be []\n}`;
  }
  if (lang === "python") {
    return `# 🐛 Buggy implementation — fix the logic\ndef solve(nums, target):\n    for i in range(len(nums) + 1):       # off-by-one\n        for j in range(i, len(nums)):\n            if nums[i] + nums[j] == target\n                return [i, j]\n    return None`;
  }
  return `// 🐛 Buggy implementation — fix it\n${starter}`;
};

// crude complexity heuristic
const analyzeCode = (code: string) => {
  const loops = (code.match(/for\s*\(|while\s*\(|\.map\(|\.forEach\(/g) || []).length;
  const nested = /for[\s\S]{0,200}for|while[\s\S]{0,200}while|for[\s\S]{0,200}while/.test(code);
  const recursion = /function\s+(\w+)[\s\S]*\1\s*\(/.test(code);
  let complexity = "O(1)";
  if (loops === 1) complexity = "O(n)";
  if (nested) complexity = "O(n²)";
  if (recursion && nested) complexity = "O(2^n)";
  else if (recursion) complexity = "O(n log n)";

  const lines = code.split("\n").filter(l => l.trim()).length;
  const memory = nested ? "High" : loops > 0 ? "Moderate" : "Low";
  const quality = Math.max(40, Math.min(98, 100 - lines * 1.5 - (nested ? 15 : 0) + (code.includes("//") || code.includes("#") ? 5 : 0)));
  return { complexity, memory, quality: Math.round(quality), suggestion: nested ? "Can improve — try a hash map" : loops ? "Looks linear — solid" : "Trivial — verify edge cases" };
};

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
        style={{ background: ["#a855f7", "#3b82f6", "#22c55e", "#eab308"][i % 4], boxShadow: "0 0 12px currentColor" }}
      />
    ))}
  </div>
);

const CodingWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`/coding/problems/${id}`);
        if (res.data.success) {
          setProblem(res.data.problem);
        } else {
          throw new Error("Failed to load problem");
        }
      } catch (err) {
        console.warn("Failed to fetch problem from backend, falling back to local static problem details:", err);
        const staticP = problems.find(p => p.id === Number(id));
        if (staticP) setProblem(staticP);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");
  const [solLang, setSolLang] = useState("javascript");
  const [result, setResult] = useState<SubmissionResult>({ status: null });
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [bookmarked, setBookmarked] = useState(false);

  // NEW state
  const [realWorld, setRealWorld] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);
  const [aiMessages, setAiMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hey! I'm your AI Mentor 🤖 — ask for a hint, code explanation, or optimization." },
  ]);
  const [aiThinking, setAiThinking] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [particles, setParticles] = useState(false);

  const { user, setUser } = useUser();
  const xp = user?.points || 0;
  const streak = user?.streak || 0;

  useEffect(() => {
    if (problem) {
      const saved = localStorage.getItem(`code_${problem.id}_${language}_${activeTab === "debug" ? "dbg" : "main"}`);
      if (activeTab === "debug") {
        setCode(saved || buggyCodeFor(problem, language));
      } else {
        setCode(saved || problem.starterCode?.[language] || "");
      }
      setCustomInput(problem.testCases?.[0]?.input || "");
      const bm = JSON.parse(localStorage.getItem("bookmarkedProblems") || "[]");
      setBookmarked(bm.includes(problem.id));
    }
  }, [problem, language, activeTab]);

  useEffect(() => {
    if (problem && code) {
      const key = `code_${problem.id}_${language}_${activeTab === "debug" ? "dbg" : "main"}`;
      localStorage.setItem(key, code);
    }
  }, [code, problem, language, activeTab]);

  const analysis = useMemo(() => analyzeCode(code), [code]);

  const simulateRun = useCallback(async () => {
    if (!problem) return;
    setIsRunning(true);
    setBottomTab("result");
    setResult({ status: null });
    try {
      const res = await api.post(`/coding/problems/${problem.id}/run`, {
        code,
        language
      });
      if (res.data.success) {
        const firstResult = res.data.results?.[0]?.actual || "";
        let status: SubmissionResult["status"] = "Wrong Answer";
        
        if (firstResult.startsWith("Compilation Error:")) {
          status = "Runtime Error";
        } else if (firstResult.startsWith("Runtime Error:")) {
          status = "Runtime Error";
        } else if (res.data.passed === res.data.total) {
          status = "Accepted";
        }

        setResult({
          status,
          runtime: `${Math.floor(Math.random() * 100 + 20)}ms`,
          memory: `${(Math.random() * 20 + 30).toFixed(1)}MB`,
          testCasesPassed: res.data.passed,
          totalTestCases: res.data.total,
          output: firstResult,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to execute code run",
      });
    } finally {
      setIsRunning(false);
    }
  }, [problem, code, language]);

  const simulateSubmit = useCallback(async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setBottomTab("result");
    setResult({ status: null });
    try {
      const res = await api.post(`/coding/problems/${problem.id}/submit`, {
        code,
        language
      });
      if (res.data.success) {
        const firstResult = res.data.submission.results?.[0]?.actual || "";
        let status: SubmissionResult["status"] = "Wrong Answer";
        
        if (firstResult.startsWith("Compilation Error:")) {
          status = "Runtime Error";
        } else if (firstResult.startsWith("Runtime Error:")) {
          status = "Runtime Error";
        } else if (res.data.accepted) {
          status = "Accepted";
        }

        if (res.data.accepted) {
          const solved = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
          const alreadySolved = solved.includes(problem.id);
          if (!alreadySolved) {
            solved.push(problem.id);
            localStorage.setItem("solvedProblems", JSON.stringify(solved));
          }

          if (setUser) {
            setUser((prev: any) => ({
              ...prev,
              points: prev.points + (alreadySolved ? 0 : problem.points),
              codingSolved: prev.codingSolved + (alreadySolved ? 0 : 1),
            }));
          }

          setShowReward(true);
          setParticles(true);
          setTimeout(() => setParticles(false), 1500);
          setTimeout(() => setShowReward(false), 3500);
        } else {
          toast({ title: "❌ Wrong Answer", description: "Don't give up — check the failing case." });
        }
        setResult({
          status,
          runtime: `${Math.floor(Math.random() * 200 + 30)}ms`,
          memory: `${(Math.random() * 30 + 20).toFixed(1)}MB`,
          testCasesPassed: res.data.submission.passedTests,
          totalTestCases: res.data.submission.totalTests,
          output: firstResult,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit code",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [problem, code, language, setUser]);

  const resetCode = () => {
    if (problem) {
      const fresh = activeTab === "debug" ? buggyCodeFor(problem, language) : (problem.starterCode?.[language] || "");
      setCode(fresh);
    }
  };

  const toggleBookmark = () => {
    if (!problem) return;
    const bm: number[] = JSON.parse(localStorage.getItem("bookmarkedProblems") || "[]");
    const next = bookmarked ? bm.filter(x => x !== problem.id) : [...bm, problem.id];
    localStorage.setItem("bookmarkedProblems", JSON.stringify(next));
    setBookmarked(!bookmarked);
  };

  const askAi = (kind: "hint" | "explain" | "optimize") => {
    if (!problem) return;
    const userMsg = { hint: "Give me a hint", explain: "Explain my code", optimize: "Suggest an optimization" }[kind];
    setAiMessages(m => [...m, { role: "user", text: userMsg }]);
    setAiThinking(true);
    setTimeout(() => {
      const reply = {
        hint: problem.hints?.[0] || `Think about what data structure gives you O(1) lookups. For "${problem.title}", a hash map is your friend — store what you've seen, then check the complement.`,
        explain: `Your code is currently ${analysis.complexity}. The outer loop iterates through inputs while the inner block ${analysis.complexity.includes("²") ? "re-scans the array (the costly part)" : "does constant work"}. Quality score: ${analysis.quality}/100.`,
        optimize: problem.hints?.[2] || `${analysis.suggestion}. Replace the nested loop with a single pass using a Map — you'll drop from ${analysis.complexity} to O(n) and improve memory locality.`,
      }[kind];
      setAiMessages(m => [...m, { role: "ai", text: reply }]);
      setAiThinking(false);
    }, 900);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading problem...</h2>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Problem not found</h2>
          <button onClick={() => navigate("/coding")} className="text-primary hover:underline">Back to problems</button>
        </div>
      </div>
    );
  }

  const scenario = realWorldScenario(problem);
  const missionXp = xpForDiff[problem.difficulty];
  const missionProgress = result.status === "Accepted" ? 100 : isSubmitting ? 60 : code.trim().length > (problem.starterCode[language]?.length || 0) + 20 ? 35 : 10;

  const statusIcon = {
    Accepted: <CheckCircle2 className="w-5 h-5 text-neon-green" />,
    "Wrong Answer": <XCircle className="w-5 h-5 text-destructive" />,
    "Time Limit Exceeded": <Clock className="w-5 h-5 text-neon-yellow" />,
    "Runtime Error": <XCircle className="w-5 h-5 text-neon-orange" />,
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-6 relative bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated gradient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {particles && <Particles />}

      {/* Reward popup */}
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
              <p className="text-white font-bold text-lg">Mission Complete!</p>
              <p className="text-white/90 text-sm mt-1">+{missionXp} XP &nbsp;•&nbsp; 🔥 Streak +1</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak + Reward Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-border/60 bg-card/40 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/coding")} className="p-1.5 rounded-lg hover:bg-muted/50 transition-all hover:scale-110">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </motion.div>
            <span className="text-xs font-semibold text-orange-300">{streak} Day Streak</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <motion.span key={xp} initial={{ scale: 1.4, color: "#fde047" }} animate={{ scale: 1, color: "#fcd34d" }} className="text-xs font-bold">
              XP: {xp.toLocaleString()}
            </motion.span>
          </motion.div>
        </div>

        {/* Real-World toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 border border-border">
            <span className={`text-xs font-medium transition-colors ${!realWorld ? "text-foreground" : "text-muted-foreground"}`}>Practice</span>
            <Switch checked={realWorld} onCheckedChange={setRealWorld} />
            <span className={`text-xs font-medium transition-colors flex items-center gap-1 ${realWorld ? "text-purple-300" : "text-muted-foreground"}`}>
              <Briefcase className="w-3 h-3" /> Real-World
            </span>
          </div>
          <button onClick={toggleBookmark} className="p-1.5 rounded-lg hover:bg-muted/50 transition-all hover:scale-110">
            {bookmarked ? <BookmarkCheck className="w-4 h-4 text-neon-yellow" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button
            onClick={() => setAiOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${aiOpen ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
          >
            <Bot className="w-3.5 h-3.5" /> AI Mentor
          </button>
        </div>
      </motion.div>

      {/* Mission header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative z-10 px-4 py-2.5 border-b border-border/60 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-transparent"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <Target className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-purple-300 font-semibold">Mission {problem.id}</p>
              <h2 className="text-sm font-bold text-foreground truncate">
                {realWorld ? scenario.title : `Build "${problem.title}"`}
              </h2>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${diffBg[problem.difficulty]} ${diffColor[problem.difficulty]} flex-shrink-0`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-300 font-bold">+{missionXp} XP</span>
            </div>
            <div className="w-40">
              <Progress value={missionProgress} className="h-1.5 bg-muted/40" />
              <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{missionProgress}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[40%] border-r border-border/60 flex flex-col overflow-hidden bg-card/20 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="rounded-none border-b border-border/60 bg-card/30 justify-start px-2 h-10 overflow-x-auto w-full">
              <TabsTrigger value="description" className="text-xs">Problem</TabsTrigger>
              <TabsTrigger value="diagram" className="text-xs">📊 Diagram & Concepts</TabsTrigger>
              <TabsTrigger value="solutions" className="text-xs">✨ Solutions</TabsTrigger>
              <TabsTrigger value="debug" className="text-xs gap-1">
                <Bug className="w-3 h-3" /> Debug
              </TabsTrigger>
              <TabsTrigger value="discussion" className="text-xs">💬 Discussion</TabsTrigger>
              <TabsTrigger value="hints" className="text-xs gap-1">
                <Lightbulb className="w-3 h-3" /> Hints
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 overflow-y-auto p-5 mt-0 space-y-5">
              <AnimatePresence mode="wait">
                {realWorld ? (
                  <motion.div key="rw" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-4">
                    <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200">{scenario.ticket}</span>
                        <span className="text-[10px] text-muted-foreground">Assigned to you · Today</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-2">{scenario.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{scenario.context}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 border border-border p-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Acceptance Criteria</p>
                      <ul className="space-y-1.5 text-xs text-foreground">
                        <li className="flex gap-2"><span className="text-neon-green">✓</span> Solution must run in optimal time complexity</li>
                        <li className="flex gap-2"><span className="text-neon-green">✓</span> Pass all hidden production test cases</li>
                        <li className="flex gap-2"><span className="text-neon-green">✓</span> Memory usage below {problem.difficulty === "Hard" ? "100MB" : "50MB"}</li>
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="prac" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map(t => (
                        <span key={t} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{t}</span>
                      ))}
                    </div>
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{problem.description}</div>
                    <div className="space-y-3">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="rounded-lg bg-muted/30 border border-border p-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Example {i + 1}:</p>
                          <p className="text-sm"><span className="text-muted-foreground">Input:</span> <code className="text-neon-cyan">{ex.input}</code></p>
                          <p className="text-sm"><span className="text-muted-foreground">Output:</span> <code className="text-neon-green">{ex.output}</code></p>
                          {ex.explanation && <p className="text-muted-foreground text-xs mt-1">{ex.explanation}</p>}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Constraints:</p>
                      <ul className="space-y-1">
                        {problem.constraints.map((c, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary">•</span><code>{c}</code></li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="debug" className="flex-1 overflow-y-auto p-5 mt-0 space-y-3">
              <div className="rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-red-400" />
                  <h3 className="font-bold text-sm text-foreground">Bug Fix Mode</h3>
                </div>
                <p className="text-xs text-muted-foreground">The code in the editor has bugs. Find them, fix them, and run to verify. Look for off-by-one errors, wrong operators, and incorrect return values.</p>
              </div>
              <div className="rounded-lg bg-muted/30 border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1.5">🎯 Bug count: <span className="text-red-400">3 bugs</span></p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Loop boundary issue</li>
                  <li>• Operator typo</li>
                  <li>• Wrong return value</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="discussion" className="flex-1 overflow-y-auto mt-0">
              <DiscussionTab problemId={problem.id} />
            </TabsContent>

            <TabsContent value="diagram" className="flex-1 overflow-y-auto p-5 mt-0 space-y-4">
              {problem.diagram && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solution Flow / Structural Diagram</h3>
                  <pre className="p-4 rounded-xl bg-black/60 border border-border text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre">
                    {problem.diagram}
                  </pre>
                </div>
              )}
              {problem.explanation ? (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-bold">Concept Definition & Solution Explanation</h3>
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-white/5 border border-white/5 p-4 rounded-xl">
                    {problem.explanation}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No diagram or explanation is available for this problem yet.</p>
              )}
            </TabsContent>

            <TabsContent value="solutions" className="flex-1 overflow-y-auto p-5 mt-0 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Optimal Solutions</h3>
                <Select value={solLang} onValueChange={setSolLang}>
                  <SelectTrigger className="w-[120px] h-7 text-xs bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {problem.solutions?.[solLang] ? (
                <div className="rounded-xl bg-black/60 border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Optimal Time Complexity: {problem.complexity}</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-950/80 border border-white/5 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                    {problem.solutions[solLang]}
                  </pre>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Solution not seeded for this language.</p>
              )}
            </TabsContent>

            <TabsContent value="hints" className="flex-1 overflow-y-auto mt-0">
              <AIHintPanel problemId={problem.id} problemTitle={problem.title} difficulty={problem.difficulty} hints={problem.hints} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Editor + Bottom */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card/30 backdrop-blur-sm">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              {activeTab === "debug" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 flex items-center gap-1">
                  <Bug className="w-3 h-3" /> Debug Mode
                </span>
              )}
              <button onClick={resetCode} className="p-1.5 rounded hover:bg-muted/50 transition-all hover:scale-110">
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={monacoLangMap[language]}
              value={code}
              onChange={v => setCode(v || "")}
              theme="vs-dark"
              options={{
                fontSize: 14, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 16 },
                lineNumbers: "on", renderLineHighlight: "all",
                bracketPairColorization: { enabled: true }, automaticLayout: true,
                tabSize: 2, wordWrap: "on",
              }}
            />
          </div>

          {/* Live Code Feedback strip */}
          <motion.div
            key={analysis.complexity + analysis.quality}
            initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-3 py-1.5 border-t border-border/60 bg-gradient-to-r from-purple-500/5 to-blue-500/5 text-[11px]"
          >
            <span className="flex items-center gap-1 text-muted-foreground">
              <Gauge className="w-3 h-3" /> Complexity:
              <span className={`font-mono font-bold ${analysis.complexity.includes("²") || analysis.complexity.includes("^") ? "text-orange-300" : "text-emerald-300"}`}>
                {analysis.complexity}
              </span>
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-muted-foreground">Memory: <span className="text-foreground font-medium">{analysis.memory}</span></span>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-muted-foreground flex items-center gap-1">
              Quality:
              <span className={`font-bold ${analysis.quality > 75 ? "text-emerald-300" : analysis.quality > 50 ? "text-yellow-300" : "text-orange-300"}`}>
                {analysis.quality}/100
              </span>
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-purple-200 italic flex items-center gap-1 truncate">
              <Sparkles className="w-3 h-3 flex-shrink-0" /> {analysis.suggestion}
            </span>
          </motion.div>

          {/* Bottom Panel */}
          <div className="border-t border-border/60 bg-card/30 backdrop-blur-sm flex flex-col" style={{ height: "32%" }}>
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60">
              <div className="flex gap-1">
                <button onClick={() => setBottomTab("testcase")} className={`px-3 py-1 text-xs rounded transition-all ${bottomTab === "testcase" ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Test Cases</button>
                <button onClick={() => setBottomTab("result")} className={`px-3 py-1 text-xs rounded transition-all ${bottomTab === "result" ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>Output</button>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={simulateRun} disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                >
                  {isRunning ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3.5 h-3.5 border-2 border-foreground border-t-transparent rounded-full" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  {isRunning ? "Running..." : "Run"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 25px rgba(168, 85, 247, 0.5)" }} whileTap={{ scale: 0.96 }}
                  onClick={simulateSubmit} disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 text-white font-semibold transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/30"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  {isSubmitting ? "Judging..." : "Complete Mission"}
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {bottomTab === "testcase" && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {problem.testCases.map((tc, i) => (
                      <button key={i} onClick={() => setCustomInput(tc.input)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${customInput === tc.input ? "bg-muted/60 text-foreground" : "text-muted-foreground hover:bg-muted/30"}`}>
                        Case {i + 1}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={customInput} onChange={e => setCustomInput(e.target.value)}
                    className="w-full h-20 bg-background/50 rounded-lg p-3 text-sm font-mono text-foreground border border-border resize-none focus:outline-none focus:border-primary/50"
                  />
                </div>
              )}
              {bottomTab === "result" && (
                <div>
                  {(isRunning || isSubmitting) ? (
                    <div className="flex items-center justify-center py-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="ml-3 text-sm text-muted-foreground">{isRunning ? "Running test cases..." : "Judging submission..."}</span>
                    </div>
                  ) : result.status ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      <div className="flex items-center gap-2">
                        {statusIcon[result.status]}
                        <span className={`font-semibold text-sm ${result.status === "Accepted" ? "text-neon-green" : result.status === "Wrong Answer" ? "text-destructive" : result.status === "Time Limit Exceeded" ? "text-neon-yellow" : "text-neon-orange"}`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {result.runtime && <span>Runtime: <span className="text-foreground">{result.runtime}</span></span>}
                        {result.memory && <span>Memory: <span className="text-foreground">{result.memory}</span></span>}
                        {result.testCasesPassed !== undefined && <span>Tests: <span className="text-foreground">{result.testCasesPassed}/{result.totalTestCases}</span></span>}
                      </div>
                      {result.output && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Output:</p>
                          <code className="text-sm text-foreground bg-muted/30 px-3 py-2 rounded block">{result.output}</code>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">Run or submit your code to see results</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - AI Mentor */}
        <AnimatePresence>
          {aiOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="border-l border-border/60 bg-gradient-to-b from-purple-500/5 via-card/40 to-blue-500/5 backdrop-blur-xl flex flex-col overflow-hidden flex-shrink-0"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
                    <Bot className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-xs font-bold text-foreground">AI Mentor</p>
                    <p className="text-[10px] text-purple-300">Online · Ready to help</p>
                  </div>
                </div>
                <button onClick={() => setAiOpen(false)} className="p-1 rounded hover:bg-muted/50 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-2 border-b border-border/60">
                <button onClick={() => askAi("hint")} className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-muted/30 hover:bg-purple-500/20 hover:text-purple-200 transition-all text-[10px] font-medium text-muted-foreground group">
                  <Lightbulb className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Hint
                </button>
                <button onClick={() => askAi("explain")} className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-muted/30 hover:bg-blue-500/20 hover:text-blue-200 transition-all text-[10px] font-medium text-muted-foreground group">
                  <Wand2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Explain
                </button>
                <button onClick={() => askAi("optimize")} className="flex flex-col items-center gap-0.5 py-2 rounded-lg bg-muted/30 hover:bg-emerald-500/20 hover:text-emerald-200 transition-all text-[10px] font-medium text-muted-foreground group">
                  <Zap className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Optimize
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <AnimatePresence initial={false}>
                  {aiMessages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm"
                          : "bg-muted/40 text-foreground border border-border/40 rounded-bl-sm"
                      }`}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                  {aiThinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-3 py-2 bg-muted/40 rounded-2xl w-fit">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-2 border-t border-border/60 text-[10px] text-muted-foreground text-center">
                <ChevronRight className="w-3 h-3 inline" /> Tap a quick action to chat
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodingWorkspace;
