import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { RotateCcw, Timer, Zap, Target, AlertCircle, Keyboard } from "lucide-react";
import api from "@/services/api";
import { useUser } from "@/contexts/UserContext";

const codeSnippets = [
  `function fibonacci(n) { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); }`,
  `const mergeSort = (arr) => { if (arr.length <= 1) return arr; const mid = Math.floor(arr.length / 2); return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid))); };`,
  `class Stack { constructor() { this.items = []; } push(el) { this.items.push(el); } pop() { return this.items.pop(); } peek() { return this.items[this.items.length - 1]; } }`,
  `const binarySearch = (arr, target) => { let lo = 0, hi = arr.length - 1; while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); if (arr[mid] === target) return mid; arr[mid] < target ? lo = mid + 1 : hi = mid - 1; } return -1; };`,
  `const debounce = (fn, ms) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };`,
];

interface TypingResult {
  wpm: number;
  accuracy: number;
  mistakes: number;
  totalChars: number;
  timeTaken: number;
  date: string;
}

interface TypingGameProps {
  onClose: () => void;
}

const TypingGame = ({ onClose }: TypingGameProps) => {
  const { setUser } = useUser();
  const [snippet, setSnippet] = useState("");
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pickSnippet = useCallback(() => {
    setSnippet(codeSnippets[Math.floor(Math.random() * codeSnippets.length)]);
  }, []);

  useEffect(() => {
    pickSnippet();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pickSnippet]);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished, startTime]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (finished) return;

    if (!started) {
      setStarted(true);
      setStartTime(Date.now());
    }

    // Count new mistake if last char is wrong
    if (val.length > typed.length) {
      const newChar = val[val.length - 1];
      const expectedChar = snippet[val.length - 1];
      if (newChar !== expectedChar) {
        setMistakes((m) => m + 1);
      }
    }

    setTyped(val);

    if (val.length >= snippet.length) {
      finishGame(val);
    }
  };

  const finishGame = (finalTyped: string) => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const totalTime = (Date.now() - startTime) / 1000;
    setElapsed(Math.round(totalTime));

    // Save result
    const words = snippet.split(/\s+/).length;
    const wpm = Math.round(words / (totalTime / 60));
    let correct = 0;
    for (let i = 0; i < snippet.length; i++) {
      if (finalTyped[i] === snippet[i]) correct++;
    }
    const accuracy = Math.round((correct / snippet.length) * 100);

    const result: TypingResult = {
      wpm,
      accuracy,
      mistakes,
      totalChars: finalTyped.length,
      timeTaken: Math.round(totalTime),
      date: new Date().toISOString(),
    };

    const prev = JSON.parse(localStorage.getItem("typingResults") || "[]");
    prev.push(result);
    localStorage.setItem("typingResults", JSON.stringify(prev));

    // Sync to MongoDB
    const syncResult = async () => {
      try {
        const res = await api.post("/user/typing-test/complete");
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Failed to sync typing test to database:", err);
      }
    };
    syncResult();
  };

  const reset = () => {
    setTyped("");
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setMistakes(0);
    pickSnippet();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Compute stats
  const words = snippet.split(/\s+/).length;
  const wpm = elapsed > 0 ? Math.round(words / (elapsed / 60)) : 0;
  let correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === snippet[i]) correctChars++;
  }
  const accuracy = typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-neon-yellow" /> Speed Coding
        </h2>
        <div className="flex gap-2">
          <button onClick={reset} className="px-3 py-1.5 text-xs rounded-lg glass hover:bg-muted/40 transition-colors flex items-center gap-1.5 text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg glass hover:bg-muted/40 transition-colors text-muted-foreground">
            ✕ Close
          </button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Timer, label: "Time", value: `${elapsed}s`, color: "text-neon-cyan" },
          { icon: Zap, label: "WPM", value: started ? wpm : "—", color: "text-neon-yellow" },
          { icon: Target, label: "Accuracy", value: started ? `${accuracy}%` : "—", color: "text-neon-green" },
          { icon: AlertCircle, label: "Mistakes", value: mistakes, color: "text-neon-pink" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-3 text-center" tilt={false}>
            <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Typing Area */}
      <GlassCard className="p-5" tilt={false}>
        <div
          className="font-mono text-sm leading-7 mb-4 select-none cursor-text min-h-[80px]"
          onClick={() => inputRef.current?.focus()}
        >
          {snippet.split("").map((char, i) => {
            let cls = "text-muted-foreground/50";
            if (i < typed.length) {
              cls = typed[i] === char ? "text-neon-green" : "text-red-400 bg-red-400/15 rounded-sm";
            } else if (i === typed.length) {
              cls = "text-foreground bg-primary/25 rounded-sm animate-pulse";
            }
            return (
              <span key={i} className={cls}>
                {char}
              </span>
            );
          })}
        </div>
        <input
          ref={inputRef}
          value={typed}
          onChange={handleInput}
          disabled={finished}
          autoFocus
          className="sr-only"
          aria-label="Type here"
        />
        {!started && !finished && (
          <p className="text-xs text-muted-foreground text-center animate-pulse">
            Click above and start typing…
          </p>
        )}
      </GlassCard>

      {/* Results Panel */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GlassCard className="p-6" glow="cyan" tilt={false}>
              <h3 className="text-lg font-bold gradient-text mb-4 text-center">🏁 Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: "Speed", value: `${wpm} WPM`, color: "text-neon-yellow" },
                  { label: "Accuracy", value: `${accuracy}%`, color: "text-neon-green" },
                  { label: "Characters", value: typed.length, color: "text-neon-cyan" },
                  { label: "Mistakes", value: mistakes, color: "text-neon-pink" },
                  { label: "Time", value: `${elapsed}s`, color: "text-neon-purple" },
                ].map((r) => (
                  <div key={r.label} className="text-center">
                    <p className={`text-xl font-bold ${r.color}`}>{r.value}</p>
                    <p className="text-[11px] text-muted-foreground">{r.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-5">
                <button
                  onClick={reset}
                  className="px-6 py-2 text-sm rounded-xl gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Try Again →
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TypingGame;
