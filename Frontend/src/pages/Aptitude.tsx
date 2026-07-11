import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import InstallPWA from "@/components/shared/InstallPWA";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Sparkles, Target, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { categories } from "@/data/aptitude";
import {
  getCategoryProgress,
  getOverallAccuracy,
  getCompletedCount,
  loadProgress,
} from "@/lib/aptitudeProgress";

const Aptitude = () => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const overall = getOverallAccuracy();
  const completed = getCompletedCount();
  const totalConcepts = categories.reduce((a, c) => a + c.concepts.length, 0);
  const progressPct = Math.round((completed / totalConcepts) * 100);

  const weakest = useMemo(() => {
    const all = Object.entries(loadProgress());
    if (!all.length) return null;
    const sorted = all.sort(([, a], [, b]) => a.percent - b.percent);
    return sorted[0];
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-neon-purple" /> Aptitude Hub
        </h1>
        <InstallPWA />
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overall Accuracy", value: `${overall}%`, icon: Target, color: "text-neon-green" },
          { label: "Completed Concepts", value: `${completed}/${totalConcepts}`, icon: CheckCircle2, color: "text-neon-cyan" },
          { label: "Progress", value: `${progressPct}%`, icon: TrendingUp, color: "text-neon-yellow" },
          { label: "Categories", value: categories.length, icon: Zap, color: "text-neon-pink" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-4" tilt={false}>
              <s.icon className={`w-5 h-5 ${s.color} mb-1`} />
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Daily Quiz banner */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        <GlassCard className="p-5 bg-gradient-to-r from-purple-500/20 to-blue-500/20" tilt={false} glow="purple">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                ⚡ Daily Aptitude Challenge
              </h3>
              <p className="text-sm text-muted-foreground">5 questions • Bonus +50 XP on completion</p>
            </div>
            <Link
              to="/aptitude/daily/quiz"
              className="px-5 py-2 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Start Daily Quiz →
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      {/* Suggestion */}
      {weakest && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassCard className="p-4 border-l-4 border-neon-yellow" tilt={false}>
            <p className="text-sm text-foreground">
              💡 <span className="font-semibold">Suggestion:</span> Focus more on{" "}
              <span className="text-neon-yellow font-semibold">
                {weakest[0].split("/")[1].replace(/-/g, " ")}
              </span>{" "}
              — your accuracy was {weakest[1].percent}%.
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Category cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat, i) => {
          const pct = getCategoryProgress(cat.id, cat.concepts.length);
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className={`p-5 h-full bg-gradient-to-br ${cat.gradient}`}>
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-1">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 min-h-[40px]">{cat.description}</p>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-semibold">{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5 mb-4" />
                <Link
                  to={`/aptitude/${cat.id}`}
                  className="w-full px-4 py-2 rounded-lg glass hover:bg-muted/40 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground"
                >
                  Explore <ArrowRight className="w-4 h-4" />
                </Link>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Aptitude;
