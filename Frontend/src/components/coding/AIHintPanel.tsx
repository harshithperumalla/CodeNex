import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight, Sparkles, Lock, Eye, EyeOff } from "lucide-react";

interface AIHintPanelProps {
  problemId: number;
  problemTitle: string;
  difficulty: string;
  hints?: string[];
}

type Hint = {
  level: number;
  title: string;
  content: string;
  unlocked: boolean;
};

const getHintsForProblem = (problemId: number, title: string, difficulty: string, dbHints?: string[]): Hint[] => {
  if (dbHints && dbHints.length > 0) {
    return dbHints.map((h, i) => ({
      level: i + 1,
      title: i === 0 ? "Initial Thought" : i === 1 ? "Algorithm Pattern" : "Optimal Strategy",
      content: h,
      unlocked: false,
    }));
  }

  // Progressive hints that get more specific
  const hintSets: Record<number, Hint[]> = {
    1: [
      { level: 1, title: "Think About Data Structures", content: "Consider using a data structure that allows O(1) lookups. What data structure can map a value to something useful?", unlocked: false },
      { level: 2, title: "Hash Map Approach", content: "Use a hash map to store each number and its index as you iterate. For each number, check if its complement (target - current number) already exists in the map.", unlocked: false },
      { level: 3, title: "Implementation Detail", content: "Iterate once through the array. For each element `nums[i]`, compute `complement = target - nums[i]`. If `complement` is in your hash map, return `[map[complement], i]`. Otherwise, add `nums[i]: i` to the map.", unlocked: false },
    ],
    2: [
      { level: 1, title: "Pattern Recognition", content: "Think about what happens when you encounter an opening bracket vs a closing bracket. What data structure follows a Last-In-First-Out (LIFO) pattern?", unlocked: false },
      { level: 2, title: "Stack-Based Solution", content: "Use a stack! Push opening brackets onto the stack. When you encounter a closing bracket, check if the top of the stack has the matching opening bracket.", unlocked: false },
      { level: 3, title: "Edge Cases", content: "Don't forget: the stack should be empty at the end for the string to be valid. Also handle the case where you try to pop from an empty stack (closing bracket with no match).", unlocked: false },
    ],
  };

  // Default hints for problems without specific hints
  const defaultHints: Hint[] = [
    { level: 1, title: "Understand the Problem", content: `Break down the ${title} problem into smaller parts. What are the inputs? What exactly is the output? Try to solve a small example by hand first.`, unlocked: false },
    { level: 2, title: "Consider the Approach", content: `For a ${difficulty.toLowerCase()} problem like this, think about common patterns: ${difficulty === "Easy" ? "brute force, hash maps, two pointers" : difficulty === "Medium" ? "sliding window, BFS/DFS, dynamic programming" : "advanced DP, segment trees, graph algorithms"}. Which pattern fits best?`, unlocked: false },
    { level: 3, title: "Optimize Your Solution", content: `Once you have a working solution, analyze its time and space complexity. Can you reduce unnecessary iterations? Is there redundant computation you can cache? Consider ${difficulty === "Hard" ? "memoization or advanced data structures" : "using extra space to save time"}.`, unlocked: false },
  ];

  return (hintSets[problemId] || defaultHints).map((h, i) => ({ ...h }));
};

const AIHintPanel = ({ problemId, problemTitle, difficulty, hints: dbHints }: AIHintPanelProps) => {
  const [hints, setHints] = useState<Hint[]>(() => getHintsForProblem(problemId, problemTitle, difficulty, dbHints));
  const [isThinking, setIsThinking] = useState(false);
  const [activeHint, setActiveHint] = useState<number | null>(null);

  const unlockHint = (level: number) => {
    const hintIndex = hints.findIndex(h => h.level === level);
    if (hintIndex === -1 || hints[hintIndex].unlocked) return;

    // Check if previous hints are unlocked
    if (level > 1 && !hints[hintIndex - 1]?.unlocked) return;

    setIsThinking(true);
    setTimeout(() => {
      setHints(prev => prev.map(h => h.level === level ? { ...h, unlocked: true } : h));
      setActiveHint(level);
      setIsThinking(false);
    }, 1200);
  };

  const nextUnlockable = hints.findIndex(h => !h.unlocked);
  const allUnlocked = hints.every(h => h.unlocked);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-neon-purple" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Hint Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Progressive hints — reveal only what you need</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {hints.map((h, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${h.unlocked ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"}`}>
                {h.unlocked ? "✓" : h.level}
              </div>
              {i < hints.length - 1 && (
                <div className={`w-6 h-0.5 transition-colors ${h.unlocked ? "bg-primary/40" : "bg-muted/20"}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-[10px] text-muted-foreground">
            {hints.filter(h => h.unlocked).length}/{hints.length} revealed
          </span>
        </div>
      </div>

      {/* Hints */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {hints.map((hint, i) => {
            const canUnlock = i === nextUnlockable;
            const isPrev = i < nextUnlockable || hint.unlocked;

            return (
              <motion.div
                key={hint.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {hint.unlocked ? (
                  <div
                    className={`rounded-lg border p-4 transition-all cursor-pointer ${activeHint === hint.level ? "bg-primary/5 border-primary/30" : "bg-muted/10 border-border/50 hover:border-border"}`}
                    onClick={() => setActiveHint(activeHint === hint.level ? null : hint.level)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-neon-yellow" />
                      <span className="text-xs font-semibold text-foreground">Hint {hint.level}: {hint.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">Revealed</span>
                    </div>
                    <AnimatePresence>
                      {activeHint === hint.level && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-sm text-foreground/80 leading-relaxed mt-1">{hint.content}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => canUnlock && unlockHint(hint.level)}
                    disabled={!canUnlock || isThinking}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${canUnlock ? "border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer" : "border-border/30 bg-muted/5 opacity-50 cursor-not-allowed"}`}
                  >
                    <div className="flex items-center gap-2">
                      {canUnlock ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground/40" />
                      )}
                      <span className="text-xs font-medium text-foreground/60">
                        Hint {hint.level}: {hint.title}
                      </span>
                      {canUnlock && (
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Click to reveal
                        </span>
                      )}
                    </div>
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* AI Thinking indicator */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-xs text-primary">AI is analyzing the problem...</span>
          </motion.div>
        )}

        {/* All hints unlocked message */}
        {allUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-neon-green/5 to-neon-cyan/5 border border-neon-green/20 text-center"
          >
            <p className="text-sm font-medium text-neon-green mb-1">🎯 All hints revealed!</p>
            <p className="text-xs text-muted-foreground">Try implementing the solution step by step. You've got this!</p>
          </motion.div>
        )}

        {/* Tips section */}
        <div className="mt-4 p-3 rounded-lg bg-muted/10 border border-border/30">
          <p className="text-[10px] text-muted-foreground font-medium mb-1.5">💡 Pro Tips</p>
          <ul className="space-y-1">
            <li className="text-[10px] text-muted-foreground/70">• Try solving the problem yourself before revealing hints</li>
            <li className="text-[10px] text-muted-foreground/70">• Each hint gets progressively more specific</li>
            <li className="text-[10px] text-muted-foreground/70">• Understanding the approach matters more than the code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIHintPanel;
