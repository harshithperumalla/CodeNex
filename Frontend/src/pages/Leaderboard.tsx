import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Trophy, Radio, Flame, Star, Award, Loader2, UserX } from "lucide-react";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";

interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  points: number;
  problemsSolved: number;
  streak: number;
  avatar?: string;
}

const Leaderboard = () => {
  const { user: currentUser } = useUser();
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/user/leaderboard");
      if (res.data.success && Array.isArray(res.data.leaderboard)) {
        setPlayers(res.data.leaderboard);
      } else {
        setPlayers([]);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [currentUser?.points, currentUser?.codingSolved]);

  const top3 = players.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Trophy className="w-7 h-7 text-neon-yellow" /> Platform Leaderboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rankings calculated dynamically from real user XP, solved problems, and streaks
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-green" />
          </span>
          <Radio className="w-3.5 h-3.5 text-neon-green" />
          <span className="text-xs text-muted-foreground">Live Database Sync</span>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : players.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <UserX className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-bold text-foreground">No leaderboard data available</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            No active users registered in the database yet. Start practicing and solving coding problems to earn XP and appear here!
          </p>
        </GlassCard>
      ) : (
        <>
          {/* Top 3 Podium (If at least 1 user exists) */}
          {podiumOrder.length > 0 && (
            <div className="grid grid-cols-3 gap-4 items-end pt-4">
              {podiumOrder.map((l, i) => {
                const heights = ["h-32", "h-40", "h-28"];
                const avatarSeed = l.name || "User";
                return (
                  <motion.div
                    key={l.userId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative">
                      <img
                        src={l.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`}
                        alt={l.name}
                        className="w-14 h-14 rounded-full border-2 border-primary/50 object-cover shadow-lg"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                        #{l.rank}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-foreground mt-2 truncate max-w-[120px]">{l.name}</p>
                    <p className="text-xs text-neon-green font-bold">
                      {l.points.toLocaleString()} XP
                    </p>
                    <div className={`w-full ${heights[i]} mt-3 rounded-t-xl glass flex items-center justify-center border-t border-primary/30`}>
                      <span className="text-3xl font-bold gradient-text">#{l.rank}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full Registered User Rankings */}
          <GlassCard className="p-5 overflow-hidden" tilt={false}>
            <div className="space-y-1">
              <AnimatePresence>
                {players.map((l) => {
                  const isCurrent = currentUser && l.userId === currentUser.userId;
                  return (
                    <motion.div
                      key={l.userId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        isCurrent
                          ? "bg-primary/20 border border-primary/40 shadow-lg"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <span
                        className={`w-8 text-center font-bold text-base ${
                          l.rank <= 3 ? "text-amber-400 font-extrabold" : "text-muted-foreground"
                        }`}
                      >
                        #{l.rank}
                      </span>
                      <img
                        src={l.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(l.name)}`}
                        alt={l.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isCurrent ? "text-primary font-bold" : "text-foreground"}`}>
                          {l.name} {isCurrent && <span className="text-[10px] text-primary/80 font-normal ml-1">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-orange-400">
                            <Flame className="w-3 h-3" /> {l.streak}d streak
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Award className="w-3 h-3" /> {l.problemsSolved} solved
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {l.points.toLocaleString()} XP
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
