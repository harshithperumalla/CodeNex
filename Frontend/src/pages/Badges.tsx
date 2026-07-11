import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { useUser } from "@/contexts/UserContext";
import { Award, Zap, Code2, Brain, CheckCircle2, Lock } from "lucide-react";

interface BadgeDef {
  name: string;
  desc: string;
  emoji: string;
  category: "coding" | "aptitude" | "streak" | "course" | "social";
  getProgress: (user: any) => { current: number; target: number };
}

const badgeDefinitions: BadgeDef[] = [
  {
    name: "First Course Completed",
    desc: "Complete your first learning course",
    emoji: "🎓",
    category: "course",
    getProgress: (u) => ({ current: u?.coursesWatched || 0, target: 1 }),
  },
  {
    name: "First Coding Problem",
    desc: "Solve your first programming problem",
    emoji: "🚀",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 1 }),
  },
  {
    name: "10 Coding Problems",
    desc: "Solve 10 programming problems",
    emoji: "🔥",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 10 }),
  },
  {
    name: "25 Coding Problems",
    desc: "Solve 25 programming problems",
    emoji: "💡",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 25 }),
  },
  {
    name: "50 Coding Problems",
    desc: "Solve 50 programming problems",
    emoji: "💪",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 50 }),
  },
  {
    name: "100 Coding Problems",
    desc: "Solve 100 programming problems",
    emoji: "💯",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 100 }),
  },
  {
    name: "250 Coding Problems",
    desc: "Solve 250 programming problems",
    emoji: "🏆",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 250 }),
  },
  {
    name: "500 Coding Problems",
    desc: "Solve 500 programming problems",
    emoji: "💎",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 500 }),
  },
  {
    name: "1000 Coding Problems",
    desc: "Solve 1000 programming problems",
    emoji: "👑",
    category: "coding",
    getProgress: (u) => ({ current: u?.codingSolved || 0, target: 1000 }),
  },
  {
    name: "First Aptitude Quiz",
    desc: "Complete your first aptitude topic quiz",
    emoji: "🧠",
    category: "aptitude",
    getProgress: (u) => ({ current: u?.aptitudeCompleted || 0, target: 1 }),
  },
  {
    name: "Aptitude Beginner",
    desc: "Complete 5 aptitude quizzes",
    emoji: "📐",
    category: "aptitude",
    getProgress: (u) => ({ current: u?.aptitudeCompleted || 0, target: 5 }),
  },
  {
    name: "Aptitude Intermediate",
    desc: "Complete 15 aptitude quizzes",
    emoji: "⚖️",
    category: "aptitude",
    getProgress: (u) => ({ current: u?.aptitudeCompleted || 0, target: 15 }),
  },
  {
    name: "Aptitude Master",
    desc: "Complete 30 aptitude quizzes",
    emoji: "📊",
    category: "aptitude",
    getProgress: (u) => ({ current: u?.aptitudeCompleted || 0, target: 30 }),
  },
  {
    name: "7-Day Streak",
    desc: "Maintain a 7-day active learning streak",
    emoji: "⚡",
    category: "streak",
    getProgress: (u) => ({ current: u?.streak || 0, target: 7 }),
  },
  {
    name: "15-Day Streak",
    desc: "Maintain a 15-day active learning streak",
    emoji: "🌟",
    category: "streak",
    getProgress: (u) => ({ current: u?.streak || 0, target: 15 }),
  },
  {
    name: "30-Day Streak",
    desc: "Maintain a 30-day active learning streak",
    emoji: "🌈",
    category: "streak",
    getProgress: (u) => ({ current: u?.streak || 0, target: 30 }),
  },
  {
    name: "100-Day Streak",
    desc: "Maintain a 100-day active learning streak",
    emoji: "🔮",
    category: "streak",
    getProgress: (u) => ({ current: u?.streak || 0, target: 100 }),
  },
  {
    name: "First Meeting",
    desc: "Attend a live 1:1 mentorship or group class",
    emoji: "👥",
    category: "social",
    getProgress: (u) => ({ current: u?.meetingsAttended || 0, target: 1 }),
  },
  {
    name: "First Certificate",
    desc: "Earn your first course certificate",
    emoji: "🏅",
    category: "course",
    getProgress: (u) => ({ current: u?.certificatesEarned || 0, target: 1 }),
  },
];

const Badges = () => {
  const { user } = useUser();
  const earnedNames = user?.badgesEarned || [];

  // Separate earned from locked with calculated progress
  const unlocked = badgeDefinitions
    .filter((b) => earnedNames.includes(b.name))
    .map((b) => ({ ...b, unlocked: true }));

  const locked = badgeDefinitions
    .filter((b) => !earnedNames.includes(b.name))
    .map((b) => {
      const { current, target } = b.getProgress(user);
      const progressPercent = Math.min(100, Math.round((current / target) * 100));
      return {
        ...b,
        unlocked: false,
        current,
        target,
        progressPercent,
      };
    });

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 px-4">
      {/* Hero Header */}
      <div className="text-center md:text-left space-y-2 md:flex md:items-center md:justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text flex items-center justify-center md:justify-start gap-2.5">
            🏅 Badge Collection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete tasks, build streaks, and solve coding challenges to unlock verified profile badges.
          </p>
        </div>
        <div className="flex gap-4 items-center justify-center mt-4 md:mt-0 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
          <div className="text-center">
            <span className="block text-2xl font-black text-primary">{unlocked.length}</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Unlocked</span>
          </div>
          <div className="w-[1px] h-8 bg-border" />
          <div className="text-center">
            <span className="block text-2xl font-black text-muted-foreground">{locked.length}</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">In Progress</span>
          </div>
        </div>
      </div>

      {/* Unlocked Badges */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-neon-green" /> Unlocked Milestone Achievements ({unlocked.length})
        </h2>
        
        {unlocked.length === 0 ? (
          <GlassCard className="p-8 text-center bg-white/5 border-dashed">
            <Award className="w-10 h-10 text-muted-foreground mx-auto opacity-40 mb-2.5" />
            <p className="text-xs text-muted-foreground">You haven't unlocked any badges yet. Start by completing a daily quiz or coding problem!</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {unlocked.map((b, i) => (
              <GlassCard key={b.name} delay={i * 0.05} glow="purple" className="p-5 text-center cursor-pointer group" >
                <motion.span
                  className="text-5xl block mb-3 drop-shadow-md select-none group-hover:scale-125 transition-transform duration-300"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.2 }}
                >
                  {b.emoji}
                </motion.span>
                <h3 className="font-bold text-foreground text-sm truncate">{b.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug h-8 overflow-hidden">{b.desc}</p>
                <span className="inline-block mt-3 text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-semibold font-mono">
                  VERIFIED
                </span>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Locked / In Progress Badges */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-muted-foreground" /> Locked / In Progress ({locked.length})
        </h2>

        {locked.length === 0 ? (
          <GlassCard className="p-8 text-center bg-white/5 border-dashed">
            <Zap className="w-10 h-10 text-neon-green mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Amazing! You've unlocked every single achievement badge on CodeNex! 👑</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locked.map((b, i) => (
              <GlassCard key={b.name} delay={i * 0.04} className="p-5 text-center opacity-75 border-white/5 hover:opacity-100 transition-opacity">
                <span className="text-5xl block mb-3 grayscale opacity-45">{b.emoji}</span>
                <h3 className="font-bold text-foreground text-sm truncate">{b.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug h-8 overflow-hidden">{b.desc}</p>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.progressPercent}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                    className="h-full rounded-full gradient-primary"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 font-mono">
                  <span>{b.current} / {b.target}</span>
                  <span>{b.progressPercent}%</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Badges;
