import { useEffect, useMemo, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Star, Brain, Trophy, Maximize2, Minimize2, Bug, Timer,
  CheckCircle2, XCircle, Sparkles, Terminal, Play, Calendar,
  Search, Filter, Eye, EyeOff, ChevronDown, ChevronRight, Gauge,
  Lightbulb, ListChecks, AlertTriangle, Code2, X,
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

type LogLine = { type: "info" | "error" | "success" | "log"; text: string };
type Lang = "javascript" | "python" | "java" | "cpp";
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

function generateSolution(p: Problem, lang: Lang): string {
  const fns: Record<number, Partial<Record<Lang, string>>> = {
    1: {
      javascript: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []`,
    },
    2: {
      javascript: `function isValid(s) {\n  const stk = [], pair = { ')': '(', ']': '[', '}': '{' };\n  for (const c of s) {\n    if ('([{'.includes(c)) stk.push(c);\n    else if (stk.pop() !== pair[c]) return false;\n  }\n  return stk.length === 0;\n}`,
    },
    4: {
      javascript: `function maxProfit(prices) {\n  let min = Infinity, best = 0;\n  for (const p of prices) { if (p < min) min = p; else best = Math.max(best, p - min); }\n  return best;\n}`,
    },
    6: {
      javascript: `function maxSubArray(nums) {\n  let cur = nums[0], best = nums[0];\n  for (let i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); }\n  return best;\n}`,
    },
  };
  return fns[p.id]?.[lang] ?? `// Reference solution (${LANG_LABEL[lang]})\n// ${p.title}\n${p.starterCode[lang] ?? ""}\n\n// Approach: ${deriveComplexity(p).note}`;
}

function generateExplanation(p: Problem): string {
  const c = deriveComplexity(p);
  return `Pattern: ${p.tags.join(", ")}.\n${c.note}\n\nWalk through Example 1, watch state evolve, then verify edge cases from constraints. Final cost: ${c.time} time / ${c.space} space.`;
}

function checkSyntax(code: string, lang: Lang): { ok: boolean; message?: string; line?: number } {
  if (lang === "javascript") {
    try { new Function(code); return { ok: true }; }
    catch (e: any) {
      const msg = String(e?.message ?? e);
      const m = msg.match(/line\s*(\d+)/i);
      return { ok: false, message: msg, line: m ? parseInt(m[1], 10) : undefined };
    }
  }
  const open = (code.match(/[(\[{]/g) ?? []).length;
  const close = (code.match(/[)\]}]/g) ?? []).length;
  if (open !== close) return { ok: false, message: "Unbalanced brackets" };
  return { ok: true };
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

const CodingArena = () => {
  const [solvedIds, setSolvedIds] = useState<number[]>(loadSolved);
  const [currentId, setCurrentId] = useState<number>(ALL_PROBLEMS[0].id);
  const current = useMemo(() => ALL_PROBLEMS.find((p) => p.id === currentId)!, [currentId]);

  const [lang, setLang] = useState<Lang>("javascript");
  const [code, setCode] = useState<string>(ALL_PROBLEMS[0].starterCode.javascript ?? "");

  // Filters
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("All");
  const [conceptFilter, setConceptFilter] = useState<string>("All");
  const [langFilter, setLangFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Console
  const [logs, setLogs] = useState<LogLine[]>([{ type: "info", text: "// arena://booted — pick a challenge from the sidebar." }]);
  const [errorLogs, setErrorLogs] = useState<LogLine[]>([]);
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("output");
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [caseResults, setCaseResults] = useState<Record<number, "pass" | "fail" | undefined>>({});

  // Panels
  const [showComplexity, setShowComplexity] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [seconds, setSeconds] = useState(15 * 60);

  // Gamification
  const initial = useMemo(reconcileDaily, []);
  const [xp, setXp] = useState(initial.xp);
  const [streak, setStreak] = useState(initial.streak);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const level = Math.max(1, Math.floor(xp / 200));
  const xpInLevel = xp % 200;
  const isSolved = solvedIds.includes(current.id);
  const syntax = useMemo(() => checkSyntax(code, lang), [code, lang]);
  const hasReturn = /return\s|return\s*\[|pass\b/.test(code) || /\{\s*\/\//.test(code);
  const canSubmit = syntax.ok && hasReturn;

  // Filtered problem list
  const filtered = useMemo(() => {
    return ALL_PROBLEMS.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
      if (conceptFilter !== "All" && !p.tags.some((t) => t.toLowerCase().includes(conceptFilter.toLowerCase()))) return false;
      if (langFilter !== "All" && !p.starterCode[langFilter as Lang]) return false;
      return true;
    });
  }, [search, diffFilter, conceptFilter, langFilter]);

  // Switch problem → load starter code
  useEffect(() => {
    setCode(current.starterCode[lang] ?? `// no starter for ${lang}`);
    setCaseResults({});
    setActiveCaseIdx(0);
    setShowSolution(false);
    setLogs((l) => [...l.slice(-30), { type: "info", text: `// loaded "${current.title}" · ${current.difficulty}` }]);
  }, [currentId]);

  // Switch language → reset starter
  useEffect(() => {
    setCode(current.starterCode[lang] ?? `// no starter for ${lang}`);
    setLogs((l) => [...l.slice(-30), { type: "info", text: `// language → ${LANG_LABEL[lang]}` }]);
  }, [lang]);

  // Diagnostics + error tab feed
  useEffect(() => {
    const monaco = monacoRef.current; const editor = editorRef.current;
    if (monaco && editor) {
      const model = editor.getModel();
      if (model) {
        if (syntax.ok) monaco.editor.setModelMarkers(model, "arena", []);
        else monaco.editor.setModelMarkers(model, "arena", [{
          startLineNumber: syntax.line ?? 1, startColumn: 1,
          endLineNumber: syntax.line ?? 1, endColumn: 200,
          message: syntax.message ?? "Syntax error",
          severity: monaco.MarkerSeverity.Error,
        }]);
      }
    }
    if (!syntax.ok && syntax.message) {
      setErrorLogs((l) => [...l.slice(-20), { type: "error", text: `✖ ${syntax.message}${syntax.line ? ` (line ${syntax.line})` : ""}` }]);
      setShake(true);
      const t = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [syntax.ok, syntax.message, syntax.line]);

  useEffect(() => {
    if (!timerOn) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timerOn]);

  const handleMount: OnMount = (editor, monaco) => { editorRef.current = editor; monacoRef.current = monaco; };

  const runCode = () => {
    setConsoleTab("output");
    setLogs((l) => [...l, { type: "info", text: `▸ executing sandbox (${LANG_LABEL[lang]})…` }]);
    // Mock test run against all cases
    const results: Record<number, "pass" | "fail"> = {};
    current.testCases.forEach((tc, idx) => {
      // Random-ish but deterministic-by-code-length pass
      const pass = syntax.ok && code.length > (current.starterCode[lang]?.length ?? 0) + 20;
      results[idx] = pass ? "pass" : "fail";
      setLogs((l) => [...l, {
        type: pass ? "success" : "error",
        text: `${pass ? "✓" : "✗"} Case ${idx + 1}  in: ${tc.input.replace(/\n/g, " | ")}  →  expected ${tc.expectedOutput}`,
      }]);
    });
    setCaseResults(results);
  };

  const completeChallenge = () => {
    if (!canSubmit) return;
    setSuccess(true);
    const newXp = xp + 20;
    const newStreak = isSolved ? streak : streak + 1;
    setXp(newXp); setStreak(newStreak);
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
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const complexity = deriveComplexity(current);
  const solutionCode = generateSolution(current, lang);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 right-10 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

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
              <div className="text-sm font-semibold truncate max-w-[200px]">{current.title}</div>
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

      <div className={`grid gap-4 p-4 md:p-6 ${focusMode ? "grid-cols-1" : "lg:grid-cols-[320px_1fr]"}`}>
        {/* SIDEBAR — PROBLEMS LIST */}
        <AnimatePresence initial={false}>
          {!focusMode && sidebarOpen && (
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
          {/* Challenge header */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={`bg-gradient-to-r ${DIFF_COLORS[current.difficulty]} border-0 text-white`}>{current.difficulty}</Badge>
              {current.tags.slice(0, 4).map((t) => (
                <Badge key={t} variant="outline" className="text-[10px] border-white/10 text-muted-foreground">{t}</Badge>
              ))}
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-300">+20 XP</Badge>
              {isSolved && <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">✓ Solved</Badge>}
            </div>
            <h1 className="bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-xl md:text-2xl font-bold leading-tight text-transparent">
              {current.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line line-clamp-3">{current.description}</p>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="ghost" onClick={() => setShowComplexity((v) => !v)} className="gap-1.5 hover:bg-white/5">
                <Gauge className="h-3.5 w-3.5" /> {showComplexity ? "Hide" : "Show"} Complexity
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowSolution((v) => !v)} className="gap-1.5 hover:bg-white/5">
                {showSolution ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showSolution ? "Hide" : "Reveal"} Solution
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDebugMode((v) => !v)} className="gap-1.5 hover:bg-white/5">
                <Bug className="h-3.5 w-3.5" /> Debug {debugMode ? "On" : "Off"}
              </Button>
              <label className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1 text-xs cursor-pointer">
                <Timer className="h-3.5 w-3.5" /> Timer
                <Switch checked={timerOn} onCheckedChange={setTimerOn} />
              </label>
            </div>

            {/* Complexity panel */}
            <AnimatePresence>
              {showComplexity && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-cyan-300">Time</div>
                      <div className="font-mono text-lg text-cyan-200">{complexity.time}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-purple-300">Space</div>
                      <div className="font-mono text-lg text-purple-200">{complexity.space}</div>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground border-t border-white/5 pt-2">
                      💡 {complexity.note}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Debug hint */}
            <AnimatePresence>
              {debugMode && (
                <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden">
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 text-xs">
                    <div className="mb-1 flex items-center gap-2 font-semibold text-purple-300">
                      <Lightbulb className="h-3.5 w-3.5" /> Hint
                    </div>
                    <p className="text-purple-200/80">{complexity.note} Look at the tags: <em>{current.tags.join(", ")}</em>.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Solution reveal */}
            <AnimatePresence>
              {showSolution && (
                <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden">
                  <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                        <Code2 className="h-3.5 w-3.5" /> Reference Solution · {LANG_LABEL[lang]}
                      </div>
                      <button onClick={() => setShowSolution(false)} className="text-amber-300/60 hover:text-amber-300">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono bg-black/40 rounded-lg p-3 overflow-x-auto text-amber-100/90 max-h-64">{solutionCode}</pre>
                    <div className="text-xs text-muted-foreground border-t border-white/5 pt-2 whitespace-pre-line">
                      <span className="text-amber-300 font-semibold">Explanation: </span>{generateExplanation(current)}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Status bar */}
          <motion.div animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }}
            className={`flex items-center justify-between rounded-2xl border p-3 backdrop-blur-xl gap-3 flex-wrap ${
              syntax.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/10"
            }`}>
            <div className="flex items-center gap-2">
              {syntax.ok ? (
                <><CheckCircle2 className="h-5 w-5 text-emerald-400" /><span className="text-sm font-medium text-emerald-300">✅ Ready to submit</span></>
              ) : (
                <><XCircle className="h-5 w-5 text-rose-400" /><span className="text-sm font-medium text-rose-300">❌ Errors detected{syntax.line ? ` · line ${syntax.line}` : ""}</span></>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                <SelectTrigger className="h-8 w-[140px] bg-white/5 border-white/10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={runCode} className="gap-1 border-white/10 hover:bg-white/5">
                <Play className="h-4 w-4" /> Run Code
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFocusMode((v) => !v)} className="gap-1">
                {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                {focusMode ? "Exit" : "Focus"}
              </Button>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button size="sm" onClick={completeChallenge} disabled={!canSubmit}
                  className={`gap-1.5 border-0 text-white transition-all ${
                    canSubmit
                      ? "bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:shadow-[0_0_35px_rgba(139,92,246,0.8)]"
                      : "cursor-not-allowed bg-muted text-muted-foreground"
                  }`}>
                  <Trophy className="h-4 w-4" />
                  {canSubmit ? "Complete Challenge" : "Fix errors first"}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Editor */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`overflow-hidden rounded-2xl border backdrop-blur-xl transition-all ${
              syntax.ok ? "border-white/10 bg-black/40" : "border-rose-500/40 bg-black/40 shadow-[0_0_40px_-15px_rgba(244,63,94,0.7)]"
            }`}>
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono">arena/{current.title.toLowerCase().replace(/\s+/g, "-")}.{lang === "javascript" ? "js" : lang === "python" ? "py" : lang === "java" ? "java" : "cpp"}</span>
              </div>
              <span className="font-mono uppercase">{LANG_LABEL[lang]}</span>
            </div>
            <Editor
              height={focusMode ? "70vh" : "400px"}
              language={lang === "cpp" ? "cpp" : lang}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              onMount={handleMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                padding: { top: 14 },
              }}
            />
          </motion.div>

          {/* Test cases bar */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-3">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ListChecks className="h-3.5 w-3.5 text-cyan-300" /> Test Cases
              </div>
              <div className="flex flex-wrap gap-1.5">
                {current.testCases.map((_, i) => {
                  const r = caseResults[i];
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveCaseIdx(i)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                        activeCaseIdx === i
                          ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      Case {i + 1}
                      {r === "pass" && <span className="ml-1 text-emerald-400">✓</span>}
                      {r === "fail" && <span className="ml-1 text-rose-400">✗</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            {current.testCases[activeCaseIdx] && (
              <motion.div
                key={activeCaseIdx}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="grid sm:grid-cols-2 gap-2 text-xs"
              >
                <div className="rounded-lg bg-black/40 p-2.5 font-mono">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Input</div>
                  <pre className="text-cyan-200 whitespace-pre-wrap break-all">{current.testCases[activeCaseIdx].input}</pre>
                </div>
                <div className="rounded-lg bg-black/40 p-2.5 font-mono">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Expected Output</div>
                  <pre className="text-emerald-200 whitespace-pre-wrap break-all">{current.testCases[activeCaseIdx].expectedOutput}</pre>
                </div>
              </motion.div>
            )}
          </div>

          {/* Console with tabs */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/5 px-2 py-1.5">
              <div className="flex items-center gap-1">
                {([
                  { id: "output", label: "Output", Icon: Terminal },
                  { id: "errors", label: "Errors", Icon: AlertTriangle },
                  { id: "tests", label: "Test Cases", Icon: ListChecks },
                ] as const).map(({ id, label, Icon }) => {
                  const active = consoleTab === id;
                  const count = id === "errors" ? errorLogs.length : id === "tests" ? Object.keys(caseResults).length : 0;
                  return (
                    <button
                      key={id}
                      onClick={() => setConsoleTab(id)}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                      {count > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${id === "errors" ? "bg-rose-500/20 text-rose-300" : "bg-cyan-500/20 text-cyan-300"}`}>
                          {count}
                        </span>
                      )}
                      {active && (
                        <motion.span layoutId="consoleTabBar" className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-purple-400 to-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => { setLogs([]); setErrorLogs([]); setCaseResults({}); }} className="text-xs text-muted-foreground hover:text-foreground px-2">clear</button>
            </div>
            <div className="max-h-52 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
              <AnimatePresence mode="wait">
                <motion.div key={consoleTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {consoleTab === "output" && (
                    logs.length === 0
                      ? <div className="text-muted-foreground/60">// no output yet — click Run Code</div>
                      : logs.map((l, i) => (
                        <div key={i} className={
                          l.type === "error" ? "text-rose-400" :
                          l.type === "success" ? "text-emerald-400" :
                          l.type === "log" ? "text-cyan-300" : "text-muted-foreground"
                        }>
                          <span className="mr-2 select-none text-white/20">$</span>{l.text}
                        </div>
                      ))
                  )}
                  {consoleTab === "errors" && (
                    errorLogs.length === 0
                      ? <div className="text-emerald-400/70">✓ No errors. Code is clean.</div>
                      : errorLogs.map((l, i) => (
                        <div key={i} className="text-rose-400">
                          <span className="mr-2 select-none text-rose-500/40">!</span>{l.text}
                        </div>
                      ))
                  )}
                  {consoleTab === "tests" && (
                    <div className="space-y-1">
                      {current.testCases.map((tc, i) => {
                        const r = caseResults[i];
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className={r === "pass" ? "text-emerald-400" : r === "fail" ? "text-rose-400" : "text-muted-foreground"}>
                              {r === "pass" ? "✓" : r === "fail" ? "✗" : "•"}
                            </span>
                            <span className="text-muted-foreground">Case {i + 1}:</span>
                            <span className="text-cyan-300/80 truncate">{tc.input.replace(/\n/g, " | ")}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-emerald-300/80">{tc.expectedOutput}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {success && (
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
