import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Trophy, TrendingUp, TrendingDown, Minus, Radio, Flame, Star } from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  prevRank?: number;
}

const SEED: Player[] = [
  { id: "1", name: "Aarav Sharma", avatar: "🧑‍💻", points: 6240, streak: 32 },
  { id: "2", name: "Priya Patel", avatar: "👩‍💻", points: 5890, streak: 28 },
  { id: "3", name: "Rohan Gupta", avatar: "🧑‍💻", points: 5620, streak: 25 },
  { id: "4", name: "Ananya Reddy", avatar: "👩‍💻", points: 5410, streak: 21 },
  { id: "5", name: "Vikram Singh", avatar: "🧑‍💻", points: 5200, streak: 19 },
  { id: "6", name: "Sneha Iyer", avatar: "👩‍💻", points: 4950, streak: 17 },
  { id: "me", name: "You", avatar: "🚀", points: 4820, streak: 14 },
  { id: "8", name: "Amit Kumar", avatar: "🧑‍💻", points: 4600, streak: 12 },
  { id: "9", name: "Divya Nair", avatar: "👩‍💻", points: 4400, streak: 10 },
  { id: "10", name: "Karthik Rajan", avatar: "🧑‍💻", points: 4200, streak: 8 },
];

const STORAGE_KEY = "leaderboard.players";

const loadPlayers = (): Player[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return SEED;
};

const Leaderboard = () => {
  const [players, setPlayers] = useState<Player[]>(loadPlayers);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [tickerMsg, setTickerMsg] = useState<string>("");
  const prevRanksRef = useRef<Record<string, number>>({});

  // Sync "You" with arena XP/streak from localStorage
  const syncMe = (list: Player[]): Player[] => {
    const xp = parseInt(localStorage.getItem("arena.xp") || "0", 10);
    const streak = parseInt(localStorage.getItem("arena.streak") || "0", 10);
    return list.map((p) =>
      p.id === "me"
        ? { ...p, points: Math.max(p.points, 4820 + xp), streak: Math.max(p.streak, streak) }
        : p
    );
  };

  // Sort + tag prev ranks
  const ranked = useMemo(() => {
    const sorted = [...players].sort((a, b) => b.points - a.points);
    return sorted.map((p, i) => ({ ...p, rank: i + 1 }));
  }, [players]);

  // Initial sync
  useEffect(() => {
    setPlayers((prev) => {
      const synced = syncMe(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
      return synced;
    });
  }, []);

  // Listen for cross-tab updates (real cross-device-style sync within the browser)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setPlayers(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "arena.xp" || e.key === "arena.streak") {
        setPlayers((prev) => syncMe(prev));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Simulated live updates every few seconds
  useEffect(() => {
    const tick = setInterval(() => {
      setPlayers((prev) => {
        const next = [...prev];
        // Pick 1-2 random players to gain points
        const updates = Math.random() > 0.6 ? 2 : 1;
        const messages: string[] = [];
        for (let i = 0; i < updates; i++) {
          const idx = Math.floor(Math.random() * next.length);
          const gain = 10 + Math.floor(Math.random() * 60);
          next[idx] = { ...next[idx], points: next[idx].points + gain };
          messages.push(`${next[idx].avatar} ${next[idx].name} +${gain} XP`);
          setPulseId(next[idx].id);
          setTimeout(() => setPulseId(null), 1500);
        }
        setTickerMsg(messages.join("  •  "));
        const synced = syncMe(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
        return synced;
      });
    }, 4500);
    return () => clearInterval(tick);
  }, []);

  // Compute rank deltas
  const withDelta = ranked.map((p) => {
    const prev = prevRanksRef.current[p.id];
    const change: "up" | "down" | "same" =
      prev === undefined || prev === p.rank ? "same" : prev > p.rank ? "up" : "down";
    return { ...p, change };
  });
  // Update prevRanks after render
  useEffect(() => {
    const map: Record<string, number> = {};
    ranked.forEach((p) => (map[p.id] = p.rank));
    prevRanksRef.current = map;
  }, [ranked]);

  const top3 = withDelta.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Trophy className="w-7 h-7 text-neon-yellow" /> Live Leaderboard
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-green" />
          </span>
          <Radio className="w-3.5 h-3.5 text-neon-green" />
          <span className="text-xs text-muted-foreground">Live • syncing</span>
        </div>
      </motion.div>

      {/* Live ticker */}
      <GlassCard className="px-4 py-2 overflow-hidden" tilt={false}>
        <AnimatePresence mode="wait">
          <motion.p
            key={tickerMsg}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="text-xs text-muted-foreground whitespace-nowrap"
          >
            {tickerMsg || "Waiting for live updates…"}
          </motion.p>
        </AnimatePresence>
      </GlassCard>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {podiumOrder.map((l, i) => {
          const heights = ["h-32", "h-40", "h-28"];
          const sizes = ["text-4xl", "text-5xl", "text-4xl"];
          return (
            <motion.div
              key={l.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.span
                className={sizes[i]}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              >
                {l.avatar}
              </motion.span>
              <p className="text-sm font-semibold text-foreground mt-2">{l.name}</p>
              <motion.p
                key={l.points}
                initial={{ scale: 1.2, color: "hsl(var(--neon-green))" }}
                animate={{ scale: 1, color: "hsl(var(--muted-foreground))" }}
                transition={{ duration: 0.6 }}
                className="text-xs"
              >
                {l.points.toLocaleString()} pts
              </motion.p>
              <div className={`w-full ${heights[i]} mt-3 rounded-t-xl glass flex items-center justify-center`}>
                <span className="text-3xl font-bold gradient-text">#{l.rank}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <GlassCard className="p-5 overflow-hidden" tilt={false}>
        <div className="space-y-1">
          <AnimatePresence>
            {withDelta.map((l) => (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  boxShadow:
                    pulseId === l.id ? "0 0 24px hsl(var(--neon-green) / 0.6)" : "0 0 0 transparent",
                }}
                transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  l.id === "me" ? "glass neon-glow-purple" : "hover:bg-muted/20"
                }`}
              >
                <span
                  className={`w-8 text-center font-bold text-lg ${
                    l.rank <= 3 ? "gradient-text" : "text-muted-foreground"
                  }`}
                >
                  {l.rank}
                </span>
                <span className="text-2xl">{l.avatar}</span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      l.id === "me" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {l.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Flame className="w-3 h-3 text-neon-orange" /> {l.streak} day streak
                  </p>
                </div>
                <motion.span
                  key={l.points}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-semibold text-foreground flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 text-neon-yellow" />
                  {l.points.toLocaleString()}
                </motion.span>
                {l.change === "up" && <TrendingUp className="w-4 h-4 text-neon-green" />}
                {l.change === "down" && <TrendingDown className="w-4 h-4 text-neon-pink" />}
                {l.change === "same" && <Minus className="w-4 h-4 text-muted-foreground" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      <p className="text-[11px] text-muted-foreground text-center">
        Mock realtime sync • Updates every few seconds • Cross-tab via storage events
      </p>
    </div>
  );
};

export default Leaderboard;
