import { motion } from "framer-motion";
import { Flame, Star, Trophy } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const StreakCounter = () => {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <motion.div
        className="glass px-4 py-2.5 flex items-center gap-2.5 rounded-xl"
        whileHover={{ scale: 1.05 }}
      >
        <motion.span
          className="text-2xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        >
          🔥
        </motion.span>
        <div>
          <p className="text-xs text-muted-foreground">Daily Streak</p>
          <p className="font-bold gradient-text-fire text-lg leading-tight">{user?.streak || 0} Days</p>
        </div>
      </motion.div>

      <motion.div
        className="glass px-4 py-2.5 flex items-center gap-2.5 rounded-xl"
        whileHover={{ scale: 1.05 }}
      >
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          ⭐
        </motion.span>
        <div>
          <p className="text-xs text-muted-foreground">Monthly Star</p>
          <p className="font-bold text-neon-yellow text-lg leading-tight">Gold</p>
        </div>
      </motion.div>

      <motion.div
        className="glass px-4 py-2.5 flex items-center gap-2.5 rounded-xl"
        whileHover={{ scale: 1.05 }}
      >
        <Trophy className="w-6 h-6 text-neon-orange" />
        <div>
          <p className="text-xs text-muted-foreground">Current Rank</p>
          <p className="font-bold text-neon-orange text-lg leading-tight">#{user?.rank || "—"}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default StreakCounter;
