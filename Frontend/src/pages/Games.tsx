import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, Zap, RefreshCw } from "lucide-react";

const games = [
  { id: "memory", name: "Memory Logic", icon: "🧠", desc: "Match pairs of code symbols", players: 290, color: "text-neon-purple" },
  { id: "reaction", name: "Reaction Time", icon: "⚡", desc: "Tap as fast as you can", players: 410, color: "text-neon-yellow" },
  { id: "predict", name: "Output Prediction", icon: "🎯", desc: "Predict what the code outputs", players: 380, color: "text-neon-orange" },
  { id: "debug", name: "Debug Challenge", icon: "🐛", desc: "Find the bug in the snippet", players: 520, color: "text-neon-pink" },
  { id: "viz", name: "Algorithm Visualizer", icon: "🌳", desc: "Watch sorting come alive", players: 340, color: "text-neon-green" },
  { id: "speed", name: "Speed Coding", icon: "⌨️", desc: "Type code as fast as you can", players: 410, color: "text-neon-cyan" },
];

// ---------- Memory Match Game ----------
const MEMORY_SYMBOLS = ["{}", "[]", "</>", "=>", "&&", "||", "++", "**"];
const MemoryGame = ({ onScore }: { onScore: (n: number) => void }) => {
  const [cards, setCards] = useState<{ s: string; flipped: boolean; matched: boolean }[]>([]);
  const [opened, setOpened] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const reset = () => {
    const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((s) => ({ s, flipped: false, matched: false }));
    setCards(deck);
    setOpened([]);
    setMoves(0);
  };
  useEffect(() => reset(), []);

  const flip = (i: number) => {
    if (opened.length === 2 || cards[i].flipped) return;
    const next = cards.slice();
    next[i] = { ...next[i], flipped: true };
    setCards(next);
    const o = [...opened, i];
    setOpened(o);
    if (o.length === 2) {
      setMoves((m) => m + 1);
      setTimeout(() => {
        setCards((cur) => {
          const c = cur.slice();
          if (c[o[0]].s === c[o[1]].s) {
            c[o[0]].matched = c[o[1]].matched = true;
          } else {
            c[o[0]].flipped = c[o[1]].flipped = false;
          }
          return c;
        });
        setOpened([]);
      }, 700);
    }
  };

  useEffect(() => {
    if (cards.length && cards.every((c) => c.matched)) {
      const score = Math.max(0, 200 - moves * 10);
      onScore(score);
    }
  }, [cards, moves, onScore]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 text-sm">
        <span>Moves: <b className="text-foreground">{moves}</b></span>
        <Button size="sm" variant="outline" onClick={reset} className="gap-1"><RefreshCw className="h-3 w-3" /> Reset</Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => flip(i)}
            className={`aspect-square rounded-lg font-mono font-bold text-lg border transition-all ${
              c.matched
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : c.flipped
                ? "bg-primary/20 border-primary/40 text-foreground"
                : "bg-white/5 border-white/10 text-transparent hover:border-primary/40"
            }`}
          >
            {c.flipped || c.matched ? c.s : "?"}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ---------- Reaction Time Game ----------
const ReactionGame = ({ onScore }: { onScore: (n: number) => void }) => {
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "done">("idle");
  const [rt, setRt] = useState<number | null>(null);
  const startRef = useRef(0);
  const tRef = useRef<ReturnType<typeof setTimeout>>();

  const begin = () => {
    setPhase("wait");
    setRt(null);
    tRef.current = setTimeout(() => {
      setPhase("go");
      startRef.current = performance.now();
    }, 1000 + Math.random() * 2500);
  };

  const click = () => {
    if (phase === "wait") {
      clearTimeout(tRef.current);
      setPhase("idle");
      return;
    }
    if (phase === "go") {
      const t = Math.round(performance.now() - startRef.current);
      setRt(t);
      setPhase("done");
      onScore(Math.max(0, 500 - t));
    }
  };

  useEffect(() => () => clearTimeout(tRef.current), []);

  return (
    <div className="text-center">
      <button
        onClick={phase === "idle" || phase === "done" ? begin : click}
        className={`w-full h-56 rounded-2xl border-2 text-2xl font-bold transition-all ${
          phase === "wait" ? "bg-rose-500/20 border-rose-500/40 text-rose-300" :
          phase === "go" ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-200 shadow-[0_0_50px_rgba(16,185,129,0.6)]" :
          "bg-primary/10 border-primary/30 text-foreground hover:border-primary"
        }`}
      >
        {phase === "idle" && "Click to start"}
        {phase === "wait" && "Wait for green…"}
        {phase === "go" && "TAP NOW!"}
        {phase === "done" && `${rt}ms — Click to retry`}
      </button>
    </div>
  );
};

// ---------- Predict Output ----------
const PREDICT_QS = [
  { code: "console.log([1,2,3].map(x=>x*2))", options: ["[2,4,6]", "[1,2,3]", "6", "Error"], correct: 0 },
  { code: "console.log(typeof null)", options: ["null", "undefined", "object", "string"], correct: 2 },
  { code: "console.log(2+'2'+2)", options: ["6", "222", "24", "42"], correct: 2 },
  { code: "[3,1,2].sort()", options: ["[1,2,3]", "[3,2,1]", "[3,1,2]", "Error"], correct: 0 },
];
const PredictGame = ({ onScore }: { onScore: (n: number) => void }) => {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === PREDICT_QS[i].correct) setScore((s) => s + 50);
    setTimeout(() => {
      if (i + 1 >= PREDICT_QS.length) {
        onScore(score + (n === PREDICT_QS[i].correct ? 50 : 0));
      } else {
        setI(i + 1);
        setPicked(null);
      }
    }, 800);
  };
  const q = PREDICT_QS[i];
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">Question {i + 1} / {PREDICT_QS.length} · Score {score}</div>
      <pre className="bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono mb-3 overflow-x-auto">{q.code}</pre>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((o, oi) => (
          <button
            key={oi}
            onClick={() => choose(oi)}
            disabled={picked !== null}
            className={`p-3 rounded-lg border font-mono text-sm text-left transition-all ${
              picked === null
                ? "border-white/10 bg-white/5 hover:border-primary/40"
                : oi === q.correct
                ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-200"
                : picked === oi
                ? "border-rose-500/50 bg-rose-500/20 text-rose-200"
                : "border-white/10 bg-white/5 opacity-50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
};

const Games = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const open = (id: string) => {
    if (id === "speed") return navigate("/typing-test");
    setScore(null);
    setActive(id);
  };

  const game = games.find((g) => g.id === active);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold gradient-text">
        🎮 Coding Games
      </motion.h1>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g, i) => (
          <GlassCard key={g.id} delay={i * 0.08} glow={i === 0 ? "cyan" : i === 2 ? "pink" : "none"} className="p-6 hover:border-primary/30 transition-colors">
            <motion.span className="text-4xl block mb-3" whileHover={{ scale: 1.2, rotate: 10 }}>{g.icon}</motion.span>
            <h3 className={`font-bold text-lg ${g.color}`}>{g.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">{g.players} playing now</span>
              <Button onClick={() => open(g.id)} size="sm" className="gradient-primary text-primary-foreground gap-1">
                <Zap className="h-3.5 w-3.5" /> Play
              </Button>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text flex items-center gap-2">
              <span className="text-2xl">{game?.icon}</span> {game?.name}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {score !== null ? (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <Trophy className="mx-auto h-14 w-14 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)]" />
                <div className="mt-3 text-3xl font-bold gradient-text">+{score} XP</div>
                <p className="text-sm text-muted-foreground mt-2">Nice run!</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                  <Button onClick={() => setScore(null)} className="gradient-primary text-primary-foreground gap-2">
                    <RefreshCw className="h-4 w-4" /> Play again
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {active === "memory" && <MemoryGame onScore={setScore} />}
                {active === "reaction" && <ReactionGame onScore={setScore} />}
                {active === "predict" && <PredictGame onScore={setScore} />}
                {active === "debug" && <PredictGame onScore={setScore} />}
                {active === "viz" && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-5xl mb-3">🌳</div>
                    <p>Visualizer coming soon — try one of the playable games!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Games;
