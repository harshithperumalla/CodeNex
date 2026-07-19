import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Star, Brain, Trophy, Maximize2, Minimize2, Bug, Timer,
  CheckCircle2, XCircle, Sparkles, Terminal, Play, Calendar,
  Search, Filter, Eye, EyeOff, ChevronDown, ChevronUp, ChevronRight, Gauge,
  Lightbulb, ListChecks, AlertTriangle, Code2, X, Loader2, ExternalLink,
  MessageSquare, BookOpen, ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { problems as ALL_PROBLEMS, type Problem } from "@/data/problems";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";

type LogLine = { type: "info" | "error" | "success" | "log"; text: string };
type Lang = "javascript" | "python" | "java" | "cpp" | "c";
type ConsoleTab = "output" | "errors" | "tests";

const CONCEPTS = ["Arrays", "Dynamic Programming", "Graphs", "Strings", "Hash Table", "Trees", "Two Pointers", "Stack"] as const;
const DIFFS = ["Easy", "Medium", "Hard"] as const;

const DIFF_COLORS: Record<string, string> = {
  Easy: "from-emerald-500 to-green-500",
  Medium: "from-amber-500 to-orange-500",
  Hard: "from-rose-500 to-red-500",
};

const LANG_LABEL: Record<Lang, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
};

const todayKey = () => new Date().toISOString().slice(0, 10);

function reconcileDaily(): { xp: number; streak: number } {
  const xp = Number(localStorage.getItem("arena.xp") ?? 320);
  const streak = Number(localStorage.getItem("arena.streak") ?? 4);
  const last = localStorage.getItem("arena.lastActive");
  if (!last) { localStorage.setItem("arena.lastActive", todayKey()); return { xp, streak }; }
  const daysSince = Math.floor((Date.parse(todayKey()) - Date.parse(last)) / 86400000);
  if (daysSince >= 2) {
    const newXp = Math.max(0, xp - 30);
    localStorage.setItem("arena.xp", String(newXp));
    localStorage.setItem("arena.streak", "0");
    localStorage.setItem("arena.lastActive", todayKey());
    setTimeout(() => toast.error(`-30 XP · Skipped ${daysSince} days. Streak reset.`), 400);
    return { xp: newXp, streak: 0 };
  }
  return { xp, streak };
}

// Heuristic complexity from tags
function deriveComplexity(p: Problem): { time: string; space: string; note: string } {
  const t = p.tags.join(",").toLowerCase();
  if (t.includes("binary search")) return { time: "O(log n)", space: "O(1)", note: "Halve the search range each step." };
  if (t.includes("dynamic programming")) return { time: "O(n)", space: "O(n)", note: "Tabulate sub-problems once." };
  if (t.includes("sliding window") || t.includes("two pointers")) return { time: "O(n)", space: "O(1)", note: "Single pass with moving boundaries." };
  if (t.includes("hash table")) return { time: "O(n)", space: "O(n)", note: "Trade space for constant lookups." };
  if (t.includes("sorting")) return { time: "O(n log n)", space: "O(log n)", note: "Sort then scan." };
  if (t.includes("bfs") || t.includes("dfs") || t.includes("graph")) return { time: "O(V + E)", space: "O(V)", note: "Visit each node/edge once." };
  if (t.includes("trie")) return { time: "O(m·k)", space: "O(m·k)", note: "m=words, k=avg word length." };
  return { time: "O(n)", space: "O(1)", note: "Linear scan suffices." };
}

function generateExplanation(p: Problem): string {
  const c = deriveComplexity(p);
  return `Pattern: ${p.tags.join(", ")}.\n${c.note}\n\nWalk through Example 1, watch state evolve, then verify edge cases from constraints. Final cost: ${c.time} time / ${c.space} space.`;
}

const Particle = ({ i }: { i: number }) => {
  const angle = (i / 24) * Math.PI * 2;
  const dist = 120 + Math.random() * 80;
  return (
    <motion.span
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.4 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      className="absolute h-2 w-2 rounded-full"
      style={{ background: `hsl(${(i * 25) % 360} 90% 65%)`, boxShadow: `0 0 12px hsl(${(i * 25) % 360} 90% 65%)` }}
    />
  );
};

const SOLVED_KEY = "arena.solvedIds";
const loadSolved = (): number[] => {
  try { return JSON.parse(localStorage.getItem(SOLVED_KEY) ?? "[]"); } catch { return []; }
};

const getLeetCodeUrl = (linkOrSlug: string) => {
  if (!linkOrSlug) return "https://leetcode.com";
  if (linkOrSlug.startsWith("http://") || linkOrSlug.startsWith("https://")) {
    return linkOrSlug;
  }
  return `https://leetcode.com/problems/${linkOrSlug}/`;
};

const CodingArena = () => {
  const { user, setUser } = useUser();
  const [solvedIds, setSolvedIds] = useState<number[]>(loadSolved);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [current, setCurrent] = useState<Problem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(false);

  // Lazy-load problems list title/difficulty/tags
  const [problems, setProblems] = useState<any[]>(() => {
    return ALL_PROBLEMS.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      points: p.points,
      leetcodeLink: p.leetcodeLink,
    }));
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get("/coding/problems");
        if (res.data.success && res.data.problems) {
          setProblems(res.data.problems);
        }
      } catch (err) {
        console.warn("Failed to load problems from API, running with local summaries:", err);
      }
    };
    fetchProblems();
  }, []);

  // Calendar variables
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const todayDate = currentDate.getDate();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const getProblemForDay = (day: number) => {
    if (!problems || problems.length === 0) return null;
    return problems[(day + 2) % problems.length];
  };

  const handleDayClick = (day: number) => {
    const prob = getProblemForDay(day);
    if (prob) {
      setCurrentId(prob.id);
    }
  };

  // Filters
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("All");
  const [conceptFilter, setConceptFilter] = useState<string>("All");
  const [langFilter, setLangFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verification States
  const [extUsername, setExtUsername] = useState("");
  const [extLink, setExtLink] = useState("");
  const [platform, setPlatform] = useState<"leetcode" | "gfg">("leetcode");
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);

  // Panels
  const [showComplexity, setShowComplexity] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [activeHintIdx, setActiveHintIdx] = useState(-1);
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(15 * 60);

  // Solutions & Discussion
  const [solutionLang, setSolutionLang] = useState<"javascript" | "python" | "java" | "cpp">("javascript");
  const [newCommentText, setNewCommentText] = useState("");
  const [discussionComments, setDiscussionComments] = useState<Record<number, { user: string; avatar: string; time: string; text: string; likes: number; liked?: boolean }[]>>({
    1: [
      { user: "harshith", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80", time: "12 hours ago", text: "Using a Hash Map makes Two Sum so elegant. O(N) time complexity is key!", likes: 14 },
      { user: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80", time: "1 day ago", text: "Anyone else get stuck on handling negatives? Make sure your complement calculation works for all target differences.", likes: 8 },
      { user: "AI Mentor", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&h=80", time: "1 day ago", text: "Remember that Hash Table insertions and lookups are amortized O(1). Great choice for an optimized one-pass scan!", likes: 21 },
    ],
    2: [
      { user: "Priya Nair", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80", time: "2 hours ago", text: "Stack LIFO logic is perfect here. Push matching opening brackets, pop on closing and compare.", likes: 11 },
      { user: "Rohan Das", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80", time: "4 hours ago", text: "Be careful to check if the stack is empty at the end. Otherwise cases like '(' will pass.", likes: 9 },
    ],
  });

  // Gamification
  const initial = useMemo(reconcileDaily, []);
  const [xp, setXp] = useState(user?.points ?? initial.xp);
  const [streak, setStreak] = useState(user?.streak ?? initial.streak);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const level = Math.max(1, Math.floor(xp / 200));
  const xpInLevel = xp % 200;
  const isSolved = current ? solvedIds.includes(current.id) : false;

  // Filtered problem list
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      if (conceptFilter !== "All" && !p.tags?.some((t) => t.toLowerCase().includes(conceptFilter.toLowerCase()))) return false;
      if (langFilter !== "All" && p.starterCode && !p.starterCode[langFilter as Lang]) return false;
      return true;
    });
  }, [problems, search, diffFilter, conceptFilter, langFilter]);

  // Load selected problem from Dashboard calendar on mount
  useEffect(() => {
    const savedProblemId = localStorage.getItem("arena.currentProblemId");
    if (savedProblemId) {
      const pid = parseInt(savedProblemId, 10);
      if (!isNaN(pid)) {
        setCurrentId(pid);
      }
      localStorage.removeItem("arena.currentProblemId");
    }
  }, []);

  // Sync user context changes
  useEffect(() => {
    if (user) {
      setXp(user.points);
      setStreak(user.streak);
    }
  }, [user]);

  // Lazy-load problem details
  const loadProblem = async (problemId: number) => {
    setLoadingProblem(true);
    try {
      const res = await api.get(`/coding/problems/${problemId}`);
      if (res.data.success && res.data.problem) {
        setCurrent(res.data.problem);
      } else {
        throw new Error("Failed to load problem");
      }
    } catch (err) {
      console.warn("Failed to fetch problem from backend, falling back to local static problem details:", err);
      const staticP = ALL_PROBLEMS.find((p) => p.id === problemId);
      if (staticP) {
        setCurrent(staticP);
      }
    } finally {
      setLoadingProblem(false);
    }
  };

  useEffect(() => {
    if (currentId !== null) {
      loadProblem(currentId);
    } else {
      setCurrent(null);
    }
  }, [currentId]);

  // Switch problem → reset solution panels
  useEffect(() => {
    if (!current) return;
    setShowSolution(false);
    setShowComplexity(false);
    setActiveHintIdx(-1);
    setExtUsername("");
    setExtLink("");
  }, [current?.id]);

  // Sync selected problem context for AI Chatbot
  useEffect(() => {
    if (current) {
      localStorage.setItem("arena.currentProblem", JSON.stringify(current));
    } else {
      localStorage.removeItem("arena.currentProblem");
    }
  }, [current]);

  useEffect(() => {
    if (!timerOn) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timerOn]);

  const handleVerifySolution = async () => {
    if (!current) return;
    if (!extUsername.trim() || !extLink.trim()) {
      toast.error("Please enter both username and submission link.");
      return;
    }

    setVerifying(true);
    setVerifyStep(1);

    const steps = [1, 2, 3, 4];
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setVerifyStep(step);
    }

    try {
      const res = await api.post(`/coding/problems/${current.id}/verify-external`, {
        platform,
        username: extUsername,
        submissionLink: extLink,
      });

      if (res.data.success) {
        setSuccess(true);
        const newXp = xp + 20;
        const newStreak = isSolved ? streak : streak + 1;
        setXp(newXp);
        setStreak(newStreak);
        localStorage.setItem("arena.xp", String(newXp));
        localStorage.setItem("arena.streak", String(newStreak));
        localStorage.setItem("arena.lastActive", todayKey());
        
        if (!isSolved) {
          const next = [...solvedIds, current.id];
          setSolvedIds(next);
          localStorage.setItem(SOLVED_KEY, JSON.stringify(next));
        }

        setTimeout(() => setSuccess(false), 2400);
        toast.success(`+20 XP earned!`, { description: `🔥 Streak: ${newStreak} days · ${current.title} solved` });

        if (setUser) {
          setUser((prev: any) => {
            const todayStr = new Date().toISOString().split("T")[0];
            const completedDates = prev.completedDates ? [...prev.completedDates] : [];
            if (!completedDates.includes(todayStr)) {
              completedDates.push(todayStr);
            }
            const hasSolvedToday = prev.completedDates?.includes(todayStr);
            const nextStreak = hasSolvedToday ? prev.streak : (prev.streak || 0) + 1;
            return {
              ...prev,
              points: prev.points + (isSolved ? 0 : current.points),
              codingSolved: prev.codingSolved + (isSolved ? 0 : 1),
              streak: nextStreak,
              completedDates,
            };
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Verification failed. Check credentials and try again.");
    } finally {
      setVerifying(false);
      setVerifyStep(0);
    }
  };

  const handleAddComment = () => {
    if (!current || !newCommentText.trim()) return;
    const comment = {
      user: user?.fullName || "Anonymous Learner",
      avatar: user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80",
      time: "Just now",
      text: newCommentText,
      likes: 0,
    };
    setDiscussionComments((prev) => ({
      ...prev,
      [current.id]: [comment, ...(prev[current.id] || [])],
    }));
    setNewCommentText("");
    toast.success("Comment posted!");
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const complexity = current ? deriveComplexity(current) : { time: "", space: "", note: "" };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 right-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.4), 0 0 8px rgba(168, 85, 247, 0.3); border-color: rgba(168, 85, 247, 0.6); }
          50% { box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.8), 0 0 16px rgba(168, 85, 247, 0.6); border-color: rgba(168, 85, 247, 1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        @keyframes check-scale {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-check-scale {
          animation: check-scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      ` }} />

      {/* TOP BAR */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
              aria-label="Toggle problems"
            >
              <ListChecks className="h-4 w-4" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 shadow-[0_0_30px_rgba(139,92,246,0.6)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Coding Arena</div>
              <div className="text-sm font-semibold truncate max-w-[200px]">{current ? current.title : "Select a Challenge"}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
              className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-orange-300">
              <Flame className="h-4 w-4 fill-orange-400 text-orange-400" />
              <span className="text-sm font-semibold">{streak}</span>
              <span className="text-xs text-orange-200/70">streak</span>
            </motion.div>

            <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-yellow-300">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold">{xp.toLocaleString()}</span>
              <span className="text-xs text-yellow-200/70">XP</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-purple-200">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-semibold">Lvl {level}</span>
              <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${(xpInLevel / 200) * 100}%` }} />
              </div>
            </div>

            {timerOn && (
              <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-cyan-200">
                <Timer className="h-4 w-4" />
                <span className="font-mono text-sm">{mmss}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`grid gap-4 p-4 md:p-6 ${sidebarOpen ? "lg:grid-cols-[320px_1fr]" : "grid-cols-1"}`}>
        {/* SIDEBAR — PROBLEMS LIST */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col"
              style={{ boxShadow: "0 0 40px -10px rgba(139,92,246,0.35)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-cyan-300" /> Problems
                  <Badge variant="outline" className="text-[10px] border-white/10">{filtered.length}</Badge>
                </h2>
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition"
                >
                  <Filter className="h-3 w-3" /> {showFilters ? "Hide" : "Filters"}
                </button>
              </div>



              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search problems…"
                  className="h-8 pl-8 bg-white/5 border-white/10 text-xs"
                />
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {/* Difficulty chips */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Difficulty</div>
                      <div className="flex flex-wrap gap-1">
                        {["All", ...DIFFS].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDiffFilter(d)}
                            className={`px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
                              diffFilter === d
                                ? `bg-gradient-to-r ${d === "All" ? "from-purple-500 to-cyan-400" : DIFF_COLORS[d]} text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]`
                                : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Concepts */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Concept</div>
                      <div className="flex flex-wrap gap-1">
                        {["All", ...CONCEPTS].map((c) => (
                          <button
                            key={c}
                            onClick={() => setConceptFilter(c)}
                            className={`px-2 py-1 rounded-full text-[10px] transition-all ${
                              conceptFilter === c
                                ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-200"
                                : "bg-white/5 hover:bg-white/10 text-muted-foreground border border-transparent"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Language */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Language Support</div>
                      <Select value={langFilter} onValueChange={setLangFilter}>
                        <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">Any</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* List */}
              <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1.5">
                {filtered.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-8">No problems match these filters.</div>
                )}
                {filtered.map((p) => {
                  const active = p.id === currentId;
                  const solved = solvedIds.includes(p.id);
                  return (
                    <motion.button
                      key={p.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentId(p.id)}
                      className={`group relative w-full text-left rounded-xl border p-2.5 transition-all overflow-hidden ${
                        active
                          ? "border-cyan-400/60 bg-gradient-to-br from-purple-500/15 to-cyan-500/15 shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)]"
                          : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeProblem"
                          className="absolute inset-0 -z-10 rounded-xl"
                          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(34,211,238,0.15))" }}
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                            {solved && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />}
                            {p.title}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge className={`bg-gradient-to-r ${DIFF_COLORS[p.difficulty]} border-0 text-white text-[9px] px-1.5 py-0`}>
                              {p.difficulty}
                            </Badge>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${solved ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>
                              {solved ? "Solved" : "Unsolved"}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${active ? "text-cyan-300 translate-x-0.5" : "text-muted-foreground group-hover:translate-x-0.5"}`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* RIGHT SIDE */}
        <div className="flex min-w-0 flex-col gap-4">
          {loadingProblem ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border border-white/5 bg-white/[0.02] rounded-2xl backdrop-blur-xl">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
              <span className="text-sm text-muted-foreground">Loading challenge details...</span>
            </div>
          ) : !current ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 border border-white/5 bg-white/[0.02] rounded-2xl backdrop-blur-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-400/20 text-cyan-300 mb-4 animate-pulse">
                <Code2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Select a Challenge</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Pick a problem from the sidebar to load the compiler, view test cases, and start coding.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Challenge Header Card */}
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className={`bg-gradient-to-r ${DIFF_COLORS[current.difficulty] || DIFF_COLORS.Easy} border-0 text-white`}>
                    {current.difficulty}
                  </Badge>
                  {current.tags?.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                      {t}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="border-yellow-500/40 text-yellow-300">
                    +{current.points || 20} XP
                  </Badge>
                  {isSolved && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ✓ Solved
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap mt-1">
                  <h1 className="bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-2xl md:text-3xl font-bold leading-tight text-transparent">
                    {current.title}
                  </h1>
                  <label className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1 text-xs cursor-pointer select-none">
                    <Timer className="h-3.5 w-3.5 text-cyan-300" /> Timer
                    <Switch checked={timerOn} onCheckedChange={setTimerOn} />
                  </label>
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: Specifications, Details, Examples, Diagrams, Discussion */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Problem Description card */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl space-y-4">
                    <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider border-b border-white/5 pb-2">
                      Problem Statement
                    </h2>
                    <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">
                      {current.description}
                    </p>
                  </div>

                  {/* Input / Output Format */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Input Format</h3>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Variables passed matching constraints. For this challenge, inputs represent:{" "}
                        <span className="font-mono text-cyan-200">
                          {current.testCases?.[0]?.input?.replace(/\n/g, ", ") || "problem-specific format"}
                        </span>.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Output Format</h3>
                      <p className="text-xs text-white/70 leading-relaxed">
                        Return matching output parameters. Expected return matches:{" "}
                        <span className="font-mono text-purple-200">
                          {current.testCases?.[0]?.expectedOutput || "valid result type"}
                        </span>.
                      </p>
                    </div>
                  </div>

                  {/* Examples */}
                  {current.examples && current.examples.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider px-1">
                        Examples
                      </h2>
                      <div className="space-y-3">
                        {current.examples.map((ex, idx) => (
                          <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.01] p-4 space-y-2">
                            <div className="text-xs font-semibold text-white/80">Example {idx + 1}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                              <div className="bg-black/30 border border-white/5 rounded-lg p-2.5">
                                <span className="text-muted-foreground block text-[10px] uppercase mb-1">Input</span>
                                <span className="text-cyan-200">{ex.input}</span>
                              </div>
                              <div className="bg-black/30 border border-white/5 rounded-lg p-2.5">
                                <span className="text-muted-foreground block text-[10px] uppercase mb-1">Output</span>
                                <span className="text-emerald-200">{ex.output}</span>
                              </div>
                            </div>
                            {ex.explanation && (
                              <div className="text-xs text-muted-foreground leading-relaxed pt-1">
                                <span className="text-white/60 font-medium">Explanation: </span>
                                {ex.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {current.constraints && current.constraints.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl space-y-3">
                      <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider border-b border-white/5 pb-2">
                        Constraints
                      </h2>
                      <ul className="list-disc pl-5 text-xs text-white/70 space-y-1.5 font-mono">
                        {current.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Diagram & Concepts */}
                  {(current.diagram || current.concepts) && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl space-y-4">
                      <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-400" /> Diagram & Core Concepts
                      </h2>
                      {current.diagram && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Dry Run Walkthrough</div>
                          <pre className="font-mono text-xs text-purple-200/90 whitespace-pre-wrap leading-relaxed bg-black/40 border border-white/5 rounded-xl p-4 overflow-x-auto">
                            {current.diagram}
                          </pre>
                        </div>
                      )}
                      {current.concepts && current.concepts.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Key Abstractions</div>
                          <div className="flex flex-wrap gap-2">
                            {current.concepts.map((concept, index) => (
                              <Badge key={index} variant="outline" className="border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs px-2.5 py-1">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discussion Forum / Comments */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl space-y-4">
                    <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-cyan-400" /> Discussion Board
                    </h2>

                    {/* Add Comment Input */}
                    <div className="flex gap-3">
                      <Input
                        placeholder="Add to the discussion..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="bg-black/30 border-white/10 text-xs h-9 text-white focus-visible:ring-cyan-500/40"
                      />
                      <Button
                        onClick={handleAddComment}
                        size="sm"
                        className="text-xs h-9 font-semibold bg-cyan-500 hover:bg-cyan-600 text-white"
                      >
                        Post
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 pt-2">
                      {(discussionComments[current.id] || []).length === 0 ? (
                        <div className="text-xs text-muted-foreground/60">// No comments on this challenge yet. Start the thread!</div>
                      ) : (
                        (discussionComments[current.id] || []).map((cmt, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <img src={cmt.avatar} alt={cmt.user} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-white/80">{cmt.user}</span>
                                <span className="text-[10px] text-muted-foreground">{cmt.time}</span>
                              </div>
                              <p className="text-white/70 leading-relaxed">{cmt.text}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
                                <button className="flex items-center gap-1 hover:text-cyan-400 transition">
                                  <ThumbsUp className="h-3 w-3" /> {cmt.likes}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 3: Solve, Verify, AI Mentor, Reference Solutions, Hints */}
                <div className="space-y-6">
                  {/* Solve on LeetCode card */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#FFA116]/10 via-[#FFA116]/5 to-transparent p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFA116]/5 blur-2xl rounded-full pointer-events-none" />
                    <h3 className="text-sm font-bold text-[#FFA116] flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4" /> Solve Externally
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Practice this challenge on LeetCode's official compiler to verify your code execution and runtime metrics.
                    </p>
                    <a
                      href={getLeetCodeUrl(current.leetcodeLink || "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FFA116] to-[#FF8C00] hover:from-[#FFB02E] hover:to-[#FFA116] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,161,22,0.3)] hover:shadow-[0_0_25px_rgba(255,161,22,0.4)] transition-all duration-300 text-center"
                    >
                      Solve on LeetCode ↗
                    </a>
                  </div>

                  {/* Verify Solution Card */}
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> Verify Solution
                      </h4>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Mock Sync</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      After successfully solving the problem, paste your username and submission link to synchronize completion status.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Platform</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(["leetcode", "gfg"] as const).map((plat) => (
                            <button
                              key={plat}
                              type="button"
                              onClick={() => setPlatform(plat)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                                platform === plat
                                  ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
                                  : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10"
                              }`}
                            >
                              {plat === "leetcode" ? "LeetCode" : "GeeksforGeeks"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder="Your Profile Username"
                          value={extUsername}
                          onChange={(e) => setExtUsername(e.target.value)}
                          disabled={verifying}
                          className="bg-black/30 border-white/10 text-xs h-9 text-white focus-visible:ring-cyan-500/40"
                        />
                        <Input
                          placeholder="Submission Detail URL / Link"
                          value={extLink}
                          onChange={(e) => setExtLink(e.target.value)}
                          disabled={verifying}
                          className="bg-black/30 border-white/10 text-xs h-9 text-white focus-visible:ring-cyan-500/40"
                        />
                      </div>

                      <AnimatePresence>
                        {verifying && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 text-xs text-white/70"
                          >
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                            <span className="font-mono text-[10px] leading-tight">
                              {verifyStep === 1 && `Connecting to ${platform === "leetcode" ? "LeetCode" : "GFG"} API...`}
                              {verifyStep === 2 && `Validating profile '${extUsername}'...`}
                              {verifyStep === 3 && `Searching submission lists for '${current.title}'...`}
                              {verifyStep === 4 && `Matching correctness metrics... Success!`}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        onClick={handleVerifySolution}
                        disabled={verifying || isSolved}
                        className="w-full text-xs h-9 font-bold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                          </>
                        ) : isSolved ? (
                          "Already Solved & Verified"
                        ) : (
                          <>Verify Solution Completeness</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Reference Solutions */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-amber-500" /> Reference Solutions
                    </h4>
                    <div className="flex gap-1.5 border-b border-white/5 pb-2">
                      {(["javascript", "python", "java", "cpp"] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setSolutionLang(lang)}
                          className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border transition-all ${
                            solutionLang === lang
                              ? "border-amber-400/50 bg-amber-500/10 text-amber-300"
                              : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10"
                          }`}
                        >
                          {lang === "cpp" ? "C++" : lang}
                        </button>
                      ))}
                    </div>
                    <pre className="font-mono text-[10px] leading-relaxed bg-black/40 border border-white/5 rounded-xl p-3 overflow-x-auto text-amber-100/90 max-h-60">
                      {current.solutions?.[solutionLang] || `// Solution in ${LANG_LABEL[solutionLang as Lang]} under construction.`}
                    </pre>
                  </div>

                  {/* AI Mentor Companion Card */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="h-4 w-4 text-purple-400" /> AI Mentor Companion
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Need help debugging, tracing a dry run, or optimizing time complexity? Ask our AI Mentor directly in the chat.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-ai-mentor", { detail: { prompt: `Give me a hint for "${current.title}"` } }))}
                        className="text-[11px] border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Lightbulb className="h-3 w-3" /> Ask for Hint
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => window.dispatchEvent(new CustomEvent("open-ai-mentor", { detail: { prompt: `Explain the dry run walkthrough for "${current.title}"` } }))}
                        className="text-[11px] border-purple-500/30 text-purple-300 hover:bg-purple-500/10 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Brain className="h-3 w-3" /> Explain Dry Run
                      </Button>
                    </div>
                  </div>

                  {/* Hints Sequential Reveal */}
                  {current.hints && current.hints.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                      <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-yellow-500" /> Interactive Hints
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {current.hints.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveHintIdx(activeHintIdx === i ? -1 : i)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                              activeHintIdx === i
                                ? "border-yellow-400 bg-yellow-500/10 text-yellow-300"
                                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                            }`}
                          >
                            Hint {i + 1}
                          </button>
                        ))}
                      </div>
                      <AnimatePresence mode="wait">
                        {activeHintIdx >= 0 && current.hints[activeHintIdx] && (
                          <motion.div
                            key={activeHintIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="bg-black/30 border border-white/5 rounded-xl p-3 text-xs leading-relaxed text-yellow-200/90"
                          >
                            {current.hints[activeHintIdx]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {success && current && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSuccess(false)}>
            <motion.div initial={{ scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-purple-600/40 via-blue-600/40 to-cyan-500/40 p-10 text-center backdrop-blur-2xl"
              style={{ boxShadow: "0 0 80px rgba(139,92,246,0.6)" }}>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {Array.from({ length: 24 }).map((_, i) => <Particle key={i} i={i} />)}
              </div>
              <Trophy className="mx-auto mb-3 h-16 w-16 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)]" />
              <div className="text-3xl font-bold text-white">🎉 Challenge Completed!</div>
              <div className="mt-2 text-cyan-100">+20 XP · Streak {streak} 🔥</div>
              <div className="mt-1 text-xs text-white/70">{current.title}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodingArena;
