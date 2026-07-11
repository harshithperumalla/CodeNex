import { motion } from "framer-motion";
import GlassCard from "../shared/GlassCard";

const activities = [
  { text: "Solved 'Two Sum' in Java", time: "2m ago", emoji: "✅" },
  { text: "Completed Aptitude Quiz - 92%", time: "15m ago", emoji: "📊" },
  { text: "Watched React Hooks Course", time: "1h ago", emoji: "📺" },
  { text: "Earned 7-Day Streak Badge", time: "2h ago", emoji: "🏅" },
  { text: "Ranked up to #7", time: "3h ago", emoji: "🚀" },
];

const ActivityFeed = () => {
  return (
    <GlassCard className="p-5" tilt={false}>
      <h3 className="font-semibold mb-4 text-foreground">Live Activity</h3>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
          >
            <span className="text-lg">{a.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{a.text}</p>
              <p className="text-xs text-muted-foreground">{a.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ActivityFeed;
