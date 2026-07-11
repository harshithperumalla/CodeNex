import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Filter } from "lucide-react";
import { getCategory, type Difficulty } from "@/data/aptitude";
import { loadProgress } from "@/lib/aptitudeProgress";

const diffColor: Record<Difficulty, string> = {
  Easy: "text-neon-green border-neon-green/40 bg-neon-green/10",
  Medium: "text-neon-yellow border-neon-yellow/40 bg-neon-yellow/10",
  Hard: "text-neon-pink border-neon-pink/40 bg-neon-pink/10",
};

const AptitudeCategory = () => {
  const { categoryId } = useParams();
  const cat = categoryId ? getCategory(categoryId) : null;
  const [diffFilter, setDiffFilter] = useState<"All" | Difficulty>("All");
  const [doneFilter, setDoneFilter] = useState<"All" | "Done" | "Pending">("All");
  const progress = loadProgress();

  if (!cat) return <Navigate to="/aptitude" replace />;

  const filtered = cat.concepts.filter((c) => {
    if (diffFilter !== "All" && c.difficulty !== diffFilter) return false;
    const done = !!progress[`${cat.id}/${c.id}`];
    if (doneFilter === "Done" && !done) return false;
    if (doneFilter === "Pending" && done) return false;
    return true;
  });

  const completedCount = cat.concepts.filter((c) => progress[`${cat.id}/${c.id}`]).length;
  const pct = Math.round((completedCount / cat.concepts.length) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/aptitude" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> All Categories
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <span className="text-3xl">{cat.icon}</span> {cat.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
          </div>
          <GlassCard className="p-3 min-w-[200px]" tilt={false}>
            <p className="text-xs text-muted-foreground mb-1">Category Progress</p>
            <Progress value={pct} className="h-2 mb-1" />
            <p className="text-xs text-foreground font-semibold">{completedCount}/{cat.concepts.length} concepts</p>
          </GlassCard>
        </div>
      </motion.div>

      {/* Filters */}
      <GlassCard className="p-4" tilt={false}>
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2">
            {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  diffFilter === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {(["All", "Done", "Pending"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDoneFilter(d)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  doneFilter === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Concept list */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((c, i) => {
          const result = progress[`${cat.id}/${c.id}`];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="p-5 h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-foreground">{c.name}</h3>
                  {result && <CheckCircle2 className="w-4 h-4 text-neon-green" />}
                </div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${diffColor[c.difficulty]}`}>
                    {c.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.questions.length} questions</span>
                  {result && (
                    <span className="text-xs text-neon-green">• Last: {result.percent}%</span>
                  )}
                </div>
                <Link
                  to={`/aptitude/${cat.id}/${c.id}/quiz`}
                  className="w-full px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {result ? "Retry Quiz" : "Start Quiz"} <ArrowRight className="w-4 h-4" />
                </Link>
              </GlassCard>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center col-span-2 py-12">
            No concepts match these filters.
          </p>
        )}
      </div>
    </div>
  );
};

export default AptitudeCategory;
