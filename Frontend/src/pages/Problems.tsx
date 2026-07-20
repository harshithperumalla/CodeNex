import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { problems, allTags, Problem } from "@/data/problems";
import {
  Search, Bookmark, BookmarkCheck, CheckCircle2, Play, Eye, Flame, Star,
  Code2, Brain, Sparkles, X, Building2, ChevronRight, Zap, Loader2, ExternalLink, RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";

const diffStyles: Record<string, { text: string; bg: string; ring: string; glow: string; hex: string }> = {
  Beginner: { text: "text-sky-300",     bg: "bg-sky-500/10",      ring: "ring-sky-400/40",     glow: "shadow-[0_0_25px_rgba(56,189,248,0.35)]",  hex: "#38bdf8" },
  Easy:     { text: "text-emerald-300", bg: "bg-emerald-500/10",  ring: "ring-emerald-400/40", glow: "shadow-[0_0_25px_rgba(16,185,129,0.35)]", hex: "#10b981" },
  Medium:   { text: "text-amber-300",   bg: "bg-amber-500/10",    ring: "ring-amber-400/40",   glow: "shadow-[0_0_25px_rgba(245,158,11,0.35)]", hex: "#f59e0b" },
  Hard:     { text: "text-rose-300",    bg: "bg-rose-500/10",     ring: "ring-rose-400/40",    glow: "shadow-[0_0_25px_rgba(244,63,94,0.35)]",  hex: "#f43f5e" },
  Expert:   { text: "text-fuchsia-300",  bg: "bg-fuchsia-500/10",   ring: "ring-fuchsia-400/40",  glow: "shadow-[0_0_25px_rgba(217,70,239,0.35)]",   hex: "#d946ef" },
};

const tagIcon = (tag: string) => {
  if (/AI|ML|Neural/i.test(tag)) return Brain;
  if (/Graph|Tree|DP|Dynamic/i.test(tag)) return Sparkles;
  return Code2;
};

const CircleStat = ({ value, total, color, label }: { value: number; total: number; color: string; label: string }) => {
  const pct = total ? Math.min(100, (value / total) * 100) : 0;
  const r = 26, c = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3 }}
      className="relative flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 30% 30%, ${color}, transparent 60%)` }} />
      <svg width="64" height="64" className="relative">
        <circle cx="32" cy="32" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
        <motion.circle
          cx="32" cy="32" r={r} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 32 32)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="32" y="37" textAnchor="middle" className="fill-white text-[13px] font-bold">{value}</text>
      </svg>
      <div className="relative">
        <div className="text-xs text-white/50 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-white">{value} / {total}</div>
      </div>
    </motion.div>
  );
};

const Problems = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // Load persisted UI state
  const persisted = (() => {
    try {
      const raw = localStorage.getItem("problems.uiState");
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return null;
  })();

  const [search, setSearch] = useState<string>(persisted?.search ?? "");
  const [diffFilters, setDiffFilters] = useState<Set<string>>(new Set(persisted?.diffFilters ?? []));
  const [tagFilters, setTagFilters] = useState<Set<string>>(new Set(persisted?.tagFilters ?? []));
  const [showAllTags, setShowAllTags] = useState<boolean>(persisted?.showAllTags ?? false);
  const [backendProblems, setBackendProblems] = useState<Problem[]>([]);
  const [active, setActive] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // External Verification States
  const [platform, setPlatform] = useState("leetcode");
  const [extUsername, setExtUsername] = useState("");
  const [extLink, setExtLink] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);

  const fetchProblems = async () => {
    try {
      const res = await api.get("/coding/problems");
      if (res.data.success && res.data.problems && res.data.problems.length > 0) {
        const enriched = res.data.problems.map((p: any) => {
          const staticP = problems.find((sp) => sp.id === p.id);
          return {
            ...p,
            companies: staticP?.companies || p.companies || [],
          };
        });
        setBackendProblems(enriched);
        if (persisted?.activeId) {
          const p = enriched.find((prob: any) => prob.id === persisted.activeId);
          if (p) setActive(p);
        }
      } else {
        console.warn("Backend problems list empty, using static problems fallback");
        setBackendProblems(problems);
        if (persisted?.activeId) {
          const p = problems.find(prob => prob.id === persisted.activeId);
          if (p) setActive(p);
        }
      }
    } catch (err) {
      console.error("Failed to load problems, falling back to static local problems:", err);
      setBackendProblems(problems);
      if (persisted?.activeId) {
        const p = problems.find(prob => prob.id === persisted.activeId);
        if (p) setActive(p);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("bookmarkedProblems") || "[]")); } catch { return new Set(); }
  });

  const [solvedSet, setSolvedSet] = useState<Set<number>>(new Set());

  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/coding/submissions");
      if (res.data.success) {
        const solvedIds = res.data.submissions
          .filter((sub: any) => sub.status === "accepted")
          .map((sub: any) => sub.problem?.id || sub.problem);
        setSolvedSet(new Set(solvedIds));
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const xp = user?.points || 0;
  const streak = user?.streak || 0;

  const allCompanies = [
    "Google", "Amazon", "Microsoft", "TCS", "Infosys", "Wipro", 
    "Accenture", "Cognizant", "Capgemini", "Deloitte", "IBM", "Tech Mahindra"
  ];

  const [companyFilters, setCompanyFilters] = useState<Set<string>>(new Set(persisted?.companyFilters ?? []));

  // Reset pagination page on filter change to prevent blank pages
  useEffect(() => {
    setCurrentPage(1);
  }, [search, diffFilters, tagFilters, companyFilters]);

  // Persist UI state on change
  useEffect(() => {
    const payload = {
      search,
      diffFilters: [...diffFilters],
      tagFilters: [...tagFilters],
      companyFilters: [...companyFilters],
      showAllTags,
      activeId: active?.id ?? null,
    };
    localStorage.setItem("problems.uiState", JSON.stringify(payload));
  }, [search, diffFilters, tagFilters, companyFilters, showAllTags, active]);

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      const isAdding = !next.has(id);
      if (isAdding) {
        next.add(id);
        toast.success("Bookmarked", {
          description: "Problem saved to your collection.",
          style: { background: "rgba(15,23,42,0.95)", border: "1px solid rgba(139,92,246,0.5)", color: "#fff", boxShadow: "0 0 20px rgba(139,92,246,0.4)" },
        });
      } else {
        next.delete(id);
        toast("Removed bookmark", {
          description: "Problem removed from your collection.",
          style: { background: "rgba(15,23,42,0.95)", border: "1px solid rgba(244,63,94,0.5)", color: "#fff", boxShadow: "0 0 20px rgba(244,63,94,0.3)" },
        });
      }
      localStorage.setItem("bookmarkedProblems", JSON.stringify([...next]));
      return next;
    });
  };

  const toggleDiff = (d: string) => setDiffFilters(prev => {
    const n = new Set(prev); n.has(d) ? n.delete(d) : n.add(d); return n;
  });
  const toggleTag = (t: string) => setTagFilters(prev => {
    const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n;
  });
  const toggleCompany = (c: string) => setCompanyFilters(prev => {
    const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n;
  });

  const filtered = useMemo(() => backendProblems.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.title.toLowerCase().includes(q) && !p.tags.some(t => t.toLowerCase().includes(q))) return false;
    if (diffFilters.size && !diffFilters.has(p.difficulty)) return false;
    if (tagFilters.size && !p.tags.some(t => tagFilters.has(t))) return false;
    if (companyFilters.size && (!p.companies || !p.companies.some(c => {
      const cLower = c.toLowerCase();
      return Array.from(companyFilters).some(cf => cf.toLowerCase() === cLower);
    }))) return false;
    return true;
  }), [backendProblems, search, diffFilters, tagFilters, companyFilters]);

  // Paginated Problems subset
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const counts = useMemo(() => ({
    easy: backendProblems.filter(p => p.difficulty === "Easy" || p.difficulty === "Beginner").length,
    medium: backendProblems.filter(p => p.difficulty === "Medium").length,
    hard: backendProblems.filter(p => p.difficulty === "Hard" || p.difficulty === "Expert").length,
    solvedEasy: backendProblems.filter(p => (p.difficulty === "Easy" || p.difficulty === "Beginner") && solvedSet.has(p.id)).length,
    solvedMed:  backendProblems.filter(p => p.difficulty === "Medium" && solvedSet.has(p.id)).length,
    solvedHard: backendProblems.filter(p => (p.difficulty === "Hard" || p.difficulty === "Expert") && solvedSet.has(p.id)).length,
  }), [backendProblems, solvedSet]);

  const visibleTags = showAllTags ? allTags : allTags.slice(0, 12);

  const handleVerifySolution = async () => {
    if (!active) return;
    if (!extUsername || !extLink) {
      toast.error("Please enter both your profile username and submission link!");
      return;
    }
    setVerifying(true);
    setVerifyStep(1);

    // Realistic API loader simulations
    await new Promise(r => setTimeout(r, 1200));
    setVerifyStep(2);
    await new Promise(r => setTimeout(r, 1500));
    setVerifyStep(3);
    await new Promise(r => setTimeout(r, 1500));
    setVerifyStep(4);
    await new Promise(r => setTimeout(r, 1000));

    try {
      const res = await api.post(`/coding/problems/${active.id}/verify-external`, {
        platform,
        username: extUsername,
        submissionLink: extLink
      });
      if (res.data.success) {
        toast.success(`🎉 External solution verified successfully!`);
        if (res.data.user) {
          setUser(res.data.user);
        }
        fetchSubmissions();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit verification result.");
    } finally {
      setVerifying(false);
      setVerifyStep(0);
      setExtLink("");
    }
  };

  return (
    <div className="relative min-h-screen text-foreground">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-pulse"
             style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
             style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", animation: "pulse 6s ease-in-out infinite" }} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
             style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)", animation: "pulse 8s ease-in-out infinite" }} />
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-7xl mx-auto px-2 py-2 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Coding Arena
            </h1>
            <p className="text-sm text-white/50 mt-1">An AI-powered coding system • pick a challenge and start the run</p>
          </div>
          <div className="flex items-center gap-3">
            {user?.isLeetCodeConnected ? (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  toast.loading("Syncing LeetCode progress...");
                  try {
                    const res = await api.post("/user/leetcode-sync");
                    if (res.data && res.data.success) {
                      setUser(res.data.user);
                      fetchProblems();
                      toast.dismiss();
                      toast.success(res.data.message || "LeetCode synced!");
                    } else {
                      toast.dismiss();
                      toast.error("Sync failed.");
                    }
                  } catch {
                    toast.dismiss();
                    toast.error("LeetCode sync failed.");
                  }
                }}
                className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 gap-1.5 h-9 rounded-full"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync LeetCode (@{user.leetcodeUsername})
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/settings")}
                className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5 h-9 rounded-full"
              >
                <Code2 className="w-3.5 h-3.5" /> Connect LeetCode
              </Button>
            )}
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">{streak}</span>
              <span className="text-xs text-white/50">streak</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10">
              <Star className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-semibold text-white">{xp}</span>
              <span className="text-xs text-white/50">XP</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CircleStat value={counts.solvedEasy} total={counts.easy} color="#10b981" label="Easy" />
          <CircleStat value={counts.solvedMed}  total={counts.medium} color="#f59e0b" label="Medium" />
          <CircleStat value={counts.solvedHard} total={counts.hard} color="#f43f5e" label="Hard" />
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search problems or tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-violet-400/40"
              />
            </div>
            <div className="flex gap-2">
              {(["Easy", "Medium", "Hard"] as const).map(d => {
                const on = diffFilters.has(d);
                const s = diffStyles[d];
                return (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggleDiff(d)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                      on
                        ? `${s.bg} ${s.text} border-white/20 ${s.glow}`
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {d}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleTags.map(t => {
              const on = tagFilters.has(t);
              return (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleTag(t)}
                  className={`px-3 py-1 rounded-full text-[11px] border transition-all ${
                    on
                      ? "bg-gradient-to-r from-violet-500/30 to-cyan-500/30 text-white border-white/30 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                      : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                  }`}
                >
                  {t}
                </motion.button>
              );
            })}
            {allTags.length > 12 && (
              <button onClick={() => setShowAllTags(v => !v)} className="px-3 py-1 rounded-full text-[11px] text-cyan-300 hover:underline">
                {showAllTags ? "Show less" : `+${allTags.length - 12} more`}
              </button>
            )}
            {(diffFilters.size > 0 || tagFilters.size > 0 || companyFilters.size > 0 || search) && (
              <button
                onClick={() => { setDiffFilters(new Set()); setTagFilters(new Set()); setCompanyFilters(new Set()); setSearch(""); }}
                className="px-3 py-1 rounded-full text-[11px] text-rose-300 hover:bg-rose-500/10"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {allCompanies.map(c => {
              const on = companyFilters.has(c);
              return (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleCompany(c)}
                  className={`px-3 py-1 rounded-full text-[11px] border transition-all ${
                    on
                      ? "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border-white/30 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "bg-white/5 text-white/60 border-white/10 hover:border-white/30"
                  }`}
                >
                  {c}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : paginatedProblems.length === 0 ? (
          <div className="py-20 text-center text-white/50">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-white/30" />
            No problems match those filters.
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {paginatedProblems.map((p, i) => {
                  const s = diffStyles[p.difficulty] || diffStyles.Easy;
                  const Icon = tagIcon(p.tags[0] || "");
                  const solved = solvedSet.has(p.id);
                  return (
                    <motion.button
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(i * 0.02, 0.2) }}
                      whileHover={{ y: -6 }}
                      onClick={() => setActive(p)}
                      className="group relative text-left rounded-2xl overflow-hidden focus:outline-none"
                    >
                      {/* gradient border */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/40 via-fuchsia-500/20 to-cyan-500/40 opacity-40 group-hover:opacity-100 transition-opacity blur-[1px]" />
                      <div className="relative m-[1px] rounded-2xl backdrop-blur-xl bg-slate-950/70 border border-white/10 p-5 h-full flex flex-col gap-3 group-hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.6)] transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl ${s.bg} ring-1 ${s.ring}`}>
                              <Icon className={`w-4 h-4 ${s.text}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] text-white/40 font-mono">#{p.id}</div>
                              <div className={`font-semibold text-white truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-200 group-hover:to-cyan-200 transition-colors`}>
                                {p.title}
                              </div>
                            </div>
                          </div>
                          <span
                            onClick={(e) => toggleBookmark(p.id, e)}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            {bookmarks.has(p.id)
                              ? <BookmarkCheck className="w-4 h-4 text-amber-300" />
                              : <Bookmark className="w-4 h-4 text-white/40" />}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.bg} ${s.text} ring-1 ${s.ring}`}>
                            {p.difficulty}
                          </span>
                          {p.tags.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-white/50">
                            <span>Acceptance</span>
                            <span className="text-white/80 font-medium">{p.acceptance}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${p.acceptance}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${s.hex}, #a78bfa)` }}
                            />
                          </div>
                        </div>

                        {/* Hover quick actions */}
                        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); navigate(`/coding/${p.id}`); }}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] cursor-pointer"
                          >
                            <Play className="w-3 h-3" /> Solve
                          </span>
                          <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); setActive(p); }}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                          </span>
                        </div>

                        {solved && (
                          <div className="absolute top-3 right-12">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40 text-xs"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40 text-xs"
                >
                  Prev
                </Button>
                <span className="text-xs text-white/60 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40 text-xs"
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40 text-xs"
                >
                  Last
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Side preview panel */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl border-l border-white/10 bg-slate-950/95 backdrop-blur-2xl text-white p-0 overflow-y-auto"
        >
          {active && (() => {
            const s = diffStyles[active.difficulty] || diffStyles.Easy;
            const solved = solvedSet.has(active.id);
            return (
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/40 font-mono">Problem #{active.id}</div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent">
                      {active.title}
                    </h2>
                  </div>
                  <button onClick={() => setActive(null)} className="p-2 rounded-lg hover:bg-white/10">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${s.bg} ${s.text} ring-1 ${s.ring}`}>
                    {active.difficulty}
                  </span>
                  {active.tags.map(t => (
                    <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>

                {/* External platform links */}
                {active.leetcodeLink && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={active.leetcodeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Solve on LeetCode
                    </a>
                  </div>
                )}

                {active.companies && active.companies.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Building2 className="w-3.5 h-3.5" />
                    {active.companies.join(" • ")}
                  </div>
                )}

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2 font-semibold">Description</div>
                  <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">{active.description}</p>
                </div>

                {active.examples && active.examples.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Examples & Diagrams</div>
                    {active.examples.map((ex, i) => (
                      <div key={i} className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono text-xs space-y-1.5">
                        <div><span className="text-violet-300">Input:</span> <span className="text-white/80">{ex.input}</span></div>
                        <div><span className="text-cyan-300">Output:</span> <span className="text-white/80">{ex.output}</span></div>
                        {ex.explanation && <div className="text-white/50 pt-1 border-t border-white/5"><span className="text-amber-300">Note:</span> {ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {active.constraints && active.constraints.length > 0 && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2 font-semibold">Constraints</div>
                    <ul className="text-sm text-white/70 space-y-1 list-disc pl-5">
                      {active.constraints.map((c, i) => <li key={i}><code className="text-xs">{c}</code></li>)}
                    </ul>
                  </div>
                )}

                {/* GFG / LEETCODE VERIFICATION MODULE */}
                <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" /> Verify LeetCode Solve
                    </h4>
                    <span className="text-[10px] text-white/40">Mock Sync Mode</span>
                  </div>
                  <p className="text-[11px] text-white/60">If you solved this problem on LeetCode, paste your credentials to instantly verify and claim your XP.</p>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="xs"
                        variant={platform === "leetcode" ? "default" : "outline"}
                        onClick={() => setPlatform("leetcode")}
                        className="text-[10px] h-7"
                      >
                        LeetCode
                      </Button>
                      <div className="text-[10px] text-white/40 flex items-center justify-center font-semibold uppercase">{platform}</div>
                    </div>
                    
                    <Input
                      placeholder="Your Profile Username"
                      value={extUsername}
                      onChange={e => setExtUsername(e.target.value)}
                      disabled={verifying}
                      className="bg-black/30 border-white/10 text-xs h-8 text-white focus-visible:ring-violet-400/40"
                    />
                    <Input
                      placeholder="Submission Detail URL / Link"
                      value={extLink}
                      onChange={e => setExtLink(e.target.value)}
                      disabled={verifying}
                      className="bg-black/30 border-white/10 text-xs h-8 text-white focus-visible:ring-violet-400/40"
                    />
                  </div>

                  <AnimatePresence>
                    {verifying && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-2 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2.5 text-xs text-white/70"
                      >
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                        <span className="font-mono text-[10px]">
                          {verifyStep === 1 && `Connecting to LeetCode API...`}
                          {verifyStep === 2 && `Validating profile '${extUsername}'...`}
                          {verifyStep === 3 && `Searching submission lists for '${active.title}'...`}
                          {verifyStep === 4 && `Matching correctness metrics... Success!`}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    onClick={handleVerifySolution}
                    disabled={verifying || solved}
                    className="w-full text-[11px] h-8 gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-1.5"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                      </>
                    ) : solved ? (
                      "Already Solved & Verified"
                    ) : (
                      <>Verify External Submission</>
                    )}
                  </Button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <Button
                    onClick={() => navigate(`/coding/${active.id}`)}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 shadow-[0_0_25px_rgba(139,92,246,0.5)] text-xs h-9"
                  >
                    <Zap className="w-4 h-4 mr-1" /> Start Coding
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(e) => toggleBookmark(active.id, e as any)}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-9"
                  >
                    {bookmarks.has(active.id) ? <BookmarkCheck className="w-4 h-4 text-amber-300" /> : <Bookmark className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Problems;
