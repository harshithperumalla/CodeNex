import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Timer, ArrowLeft, ArrowRight, X, Check, Lightbulb, BookOpen } from "lucide-react";
import { getConcept, dailyQuiz, type Question } from "@/data/aptitude";
import { saveResult } from "@/lib/aptitudeProgress";
import { toast } from "sonner";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";

const QUIZ_TIME = 10 * 60; // 10 minutes

const AptitudeQuiz = () => {
  const { categoryId, conceptId } = useParams();
  const navigate = useNavigate();

  const { setUser } = useUser();
  const isDaily = categoryId === "daily";
  const concept = !isDaily && categoryId && conceptId ? getConcept(categoryId, conceptId) : null;

  const questions: Question[] = useMemo(() => {
    if (isDaily) return dailyQuiz;
    return concept?.questions ?? [];
  }, [isDaily, concept]);

  const title = isDaily ? "Daily Aptitude Challenge" : concept?.name ?? "";

  const [viewMode, setViewMode] = useState<"theory" | "quiz">(() => {
    if (isDaily || !concept?.theory) return "quiz";
    return "theory";
  });
  const [showTheoryOverlay, setShowTheoryOverlay] = useState(false);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (finished || viewMode !== "quiz") return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, viewMode]);

  if (!isDaily && !concept) return <Navigate to="/aptitude" replace />;
  if (questions.length === 0) return <Navigate to="/aptitude" replace />;

  const score = answers.reduce((a, ans, i) => (ans === questions[i].answer ? a + 1 : a), 0);
  const attempted = answers.filter((a) => a !== null).length;

  const startQuiz = () => {
    setViewMode("quiz");
    startTime.current = Date.now();
  };

  const handleSubmit = async (auto = false) => {
    setFinished(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const finalScore = answers.reduce((a, ans, i) => (ans === questions[i].answer ? a + 1 : a), 0);
    const percent = Math.round((finalScore / questions.length) * 100);

    if (!isDaily && categoryId && conceptId) {
      saveResult(categoryId, conceptId, {
        score: finalScore,
        total: questions.length,
        percent,
        timeTaken,
        date: new Date().toISOString(),
      });

      try {
        const res = await api.post("/user/aptitude/complete", {
          categoryId,
          conceptId,
          score: finalScore,
          total: questions.length,
          percent,
        });
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Failed to sync aptitude completion to database:", err);
      }
    }
    
    if (isDaily) {
      try {
        const res = await api.post("/user/daily-quiz/complete");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Failed to sync daily quiz completion to database:", err);
      }
    }
    
    if (auto) toast.warning("Time's up! Auto-submitted.");
  };

  const setAns = (i: number) => {
    const next = [...answers];
    next[current] = i;
    setAnswers(next);
  };

  const clearAns = () => {
    const next = [...answers];
    next[current] = null;
    setAnswers(next);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const renderTheoryMarkdown = (text?: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx} className="text-base font-bold text-foreground mt-4 mb-2">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith("#### ")) {
        return <h4 key={idx} className="text-sm font-semibold text-purple-300 mt-3 mb-1.5">{trimmed.slice(5)}</h4>;
      }
      if (trimmed.startsWith("* **") && trimmed.endsWith("**")) {
        return <li key={idx} className="text-xs text-muted-foreground ml-4 list-disc my-0.5">{trimmed.slice(4)}</li>;
      }
      if (trimmed.startsWith("- **")) {
        return <li key={idx} className="text-xs text-muted-foreground ml-4 list-disc my-0.5">{trimmed.slice(2)}</li>;
      }
      if (trimmed.startsWith("* ")) {
        return <li key={idx} className="text-xs text-muted-foreground ml-4 list-disc my-0.5">{trimmed.slice(2)}</li>;
      }
      if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
        return (
          <div key={idx} className="my-2.5 p-2 rounded-lg bg-muted/30 border border-border/40 font-mono text-xs text-center overflow-x-auto text-neon-cyan">
            {trimmed.slice(2, -2).replace(/\\\\/g, "\\")}
          </div>
        );
      }
      if (trimmed.startsWith("$$")) {
        return null;
      }
      
      let cleanLine = trimmed
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, "<code class='bg-muted/80 px-1.5 py-0.5 rounded font-mono text-[11px] text-neon-cyan'>$1</code>");

      cleanLine = cleanLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-cyan-400 hover:underline inline-flex items-center gap-0.5 font-semibold">$1 <span class="text-[9px]">↗</span></a>');
      
      if (cleanLine.length === 0) return <div key={idx} className="h-2" />;
      
      return <p key={idx} className="text-xs text-muted-foreground leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: cleanLine }} />;
    });
  };

  if (viewMode === "theory" && concept?.theory) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <Link
              to={`/aptitude/${categoryId}`}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Category
            </Link>
            <span className="text-xs text-purple-300 font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">Concept Study</span>
          </div>

          <GlassCard className="p-8 space-y-6" tilt={false} glow="purple">
            <div className="border-b border-border/60 pb-4">
              <h1 className="text-2xl font-extrabold gradient-text flex items-center gap-2">
                🧠 {concept.name} Lesson Sheet
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Review the equations, explanations, and patterns before starting the quiz timer.</p>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              {renderTheoryMarkdown(concept.theory)}
            </div>

            <div className="border-t border-border/60 pt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-xs text-muted-foreground">
                ⚡ <strong>{questions.length} questions</strong> based on this theory · ⏱️ <strong>10 minutes</strong> limit
              </div>
              <button
                onClick={startQuiz}
                className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                Start Quiz Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const feedback =
      percent >= 80
        ? { msg: "Excellent performance 🎉", color: "text-neon-green" }
        : percent >= 50
        ? { msg: "Good effort 👍", color: "text-neon-yellow" }
        : { msg: "You need improvement. Keep practicing!", color: "text-neon-pink" };

    const wrongTopics = questions
      .map((q, i) => ({ q, i, ok: answers[i] === q.answer }))
      .filter((x) => !x.ok)
      .slice(0, 3);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="p-8 text-center" glow="purple" tilt={false}>
            <h1 className="text-3xl font-bold gradient-text mb-2">🏁 Quiz Complete</h1>
            <p className="text-sm text-muted-foreground mb-6">{title}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-4xl font-bold text-neon-cyan">{score}/{questions.length}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-neon-yellow">{percent}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-neon-purple">{fmtTime(timeTaken)}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
            </div>

            <p className={`text-lg font-semibold mb-6 ${feedback.color}`}>{feedback.msg}</p>

            {wrongTopics.length > 0 && (
              <div className="text-left mb-6 p-4 rounded-lg glass">
                <p className="text-sm font-semibold text-foreground mb-2">💡 Review these:</p>
                <ul className="space-y-1">
                  {wrongTopics.map((w) => (
                    <li key={w.i} className="text-xs text-muted-foreground">
                      • Q{w.i + 1}: {w.q.q.substring(0, 70)}…
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => navigate("/aptitude")}
                className="px-5 py-2 rounded-xl glass hover:bg-muted/40 text-sm text-foreground"
              >
                Back to Hub
              </button>
              <button
                onClick={() => {
                  setAnswers(questions.map(() => null));
                  setCurrent(0);
                  setTimeLeft(QUIZ_TIME);
                  setFinished(false);
                  setViewMode(isDaily || !concept?.theory ? "quiz" : "theory");
                  startTime.current = Date.now();
                }}
                className="px-5 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                Retry Lesson
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={isDaily ? "/aptitude" : `/aptitude/${categoryId}`}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          {!isDaily && concept?.theory && (
            <button
              onClick={() => setShowTheoryOverlay(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center gap-1 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" /> Concept Revision
            </button>
          )}
        </div>
        <h1 className="text-lg font-bold gradient-text">{title}</h1>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass ${timeLeft < 60 ? "neon-glow-pink" : ""}`}>
          <Timer className={`w-4 h-4 ${timeLeft < 60 ? "text-neon-pink" : "text-neon-cyan"}`} />
          <span className={`text-sm font-mono font-semibold ${timeLeft < 60 ? "text-neon-pink" : "text-foreground"}`}>
            {fmtTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px] gap-4">
        {/* Question */}
        <GlassCard className="p-6" tilt={false}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-muted-foreground">
              Question {current + 1} of {questions.length}
            </span>
            <span className="text-xs text-muted-foreground">
              Attempted: {attempted}/{questions.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-base font-medium text-foreground mb-5">{q.q}</p>
              <div className="space-y-2">
                {q.options.map((opt, i) => {
                  const selected = answers[current] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAns(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        selected
                          ? "bg-primary/20 border-primary text-foreground neon-glow-purple"
                          : "border-border text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                      }`}
                    >
                      <span className="font-mono text-xs mr-3 opacity-60">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6 flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="px-4 py-2 text-xs rounded-lg glass hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={clearAns}
                className="px-4 py-2 text-xs rounded-lg glass hover:bg-muted/40 flex items-center gap-1.5 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            <div className="flex gap-2">
              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                  className="px-4 py-2 text-xs rounded-lg gradient-primary text-primary-foreground font-medium flex items-center gap-1.5 hover:opacity-90"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  className="px-5 py-2 text-xs rounded-lg gradient-fire text-foreground font-semibold flex items-center gap-1.5 hover:opacity-90"
                >
                  <Check className="w-3.5 h-3.5" /> Submit Quiz
                </button>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Question palette */}
        <GlassCard className="p-4 h-fit" tilt={false}>
          <p className="text-xs font-semibold text-foreground mb-3">Question Map</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const isCurrent = i === current;
              const ans = answers[i];
              const cls = isCurrent
                ? "bg-primary text-primary-foreground border-primary"
                : ans !== null
                ? "bg-neon-green/20 text-neon-green border-neon-green/40"
                : "border-border text-muted-foreground hover:bg-muted/20";
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`aspect-square rounded-md text-xs font-semibold border transition-all ${cls}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1 text-[10px] text-muted-foreground">
            <p>🟣 Current</p>
            <p>🟢 Attempted</p>
            <p>⚪ Not attempted</p>
          </div>
          <button
            onClick={() => handleSubmit(false)}
            className="w-full mt-4 px-3 py-2 rounded-lg gradient-fire text-foreground text-xs font-semibold hover:opacity-90"
          >
            Submit Quiz
          </button>
        </GlassCard>
      </div>

      {/* Theory Revision Overlay */}
      <AnimatePresence>
        {showTheoryOverlay && concept?.theory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] flex flex-col p-6 rounded-2xl border border-border bg-card/95 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setShowTheoryOverlay(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4 border-b border-border/60 pb-2">
                <Lightbulb className="w-5 h-5 text-purple-400 animate-pulse" /> {concept.name} Revision Sheet
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {renderTheoryMarkdown(concept.theory)}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button
                  onClick={() => setShowTheoryOverlay(false)}
                  className="px-4 py-2 text-xs rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90"
                >
                  Close & Resume
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AptitudeQuiz;
