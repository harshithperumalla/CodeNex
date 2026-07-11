import { motion } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { useState } from "react";

const languages = [
  { name: "Java", icon: "☕", problems: 45, color: "text-neon-orange" },
  { name: "Python", icon: "🐍", problems: 38, color: "text-neon-green" },
  { name: "C/C++", icon: "⚡", problems: 22, color: "text-neon-cyan" },
  { name: "JavaScript", icon: "🟨", problems: 52, color: "text-neon-yellow" },
  { name: "Frontend", icon: "🎨", problems: 18, color: "text-neon-pink" },
  { name: "Backend", icon: "🔧", problems: 28, color: "text-neon-purple" },
  { name: "SQL", icon: "🗃️", problems: 15, color: "text-neon-cyan" },
  { name: "DSA", icon: "🌳", problems: 65, color: "text-neon-green" },
];

const problems = [
  { id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays", solved: true, points: 10 },
  { id: 2, title: "Reverse Linked List", difficulty: "Easy", category: "Linked List", solved: true, points: 10 },
  { id: 3, title: "Valid Parentheses", difficulty: "Easy", category: "Stack", solved: true, points: 10 },
  { id: 4, title: "Merge Intervals", difficulty: "Medium", category: "Arrays", solved: false, points: 20 },
  { id: 5, title: "LRU Cache", difficulty: "Medium", category: "Design", solved: false, points: 20 },
  { id: 6, title: "Binary Tree Level Order", difficulty: "Medium", category: "Trees", solved: false, points: 20 },
  { id: 7, title: "Word Search II", difficulty: "Hard", category: "Trie", solved: false, points: 40 },
  { id: 8, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Binary Search", solved: false, points: 40 },
];

const diffColor: Record<string, string> = {
  Easy: "text-neon-green",
  Medium: "text-neon-yellow",
  Hard: "text-neon-pink",
};

const Coding = () => {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold gradient-text">
        Coding Arena
      </motion.h1>

      {/* Language Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {languages.map((lang, i) => (
          <GlassCard
            key={lang.name}
            delay={i * 0.05}
            glow={selectedLang === lang.name ? "purple" : "none"}
            className={`p-4 cursor-pointer transition-all ${selectedLang === lang.name ? 'border-primary/50' : ''}`}
          >
            <div onClick={() => setSelectedLang(selectedLang === lang.name ? null : lang.name)}>
              <span className="text-2xl">{lang.icon}</span>
              <h3 className={`font-semibold mt-2 ${lang.color}`}>{lang.name}</h3>
              <p className="text-xs text-muted-foreground">{lang.problems} problems</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Problems List */}
      <GlassCard className="p-5 overflow-hidden" tilt={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Problems</h3>
          <div className="flex gap-2">
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button key={d} className="px-3 py-1 text-xs rounded-full glass hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground">
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground font-medium">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Title</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">Difficulty</span>
            <span className="col-span-2 text-right">Points</span>
          </div>
          {problems.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-2 px-3 py-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer items-center"
            >
              <span className="col-span-1 text-sm text-muted-foreground">{p.id}</span>
              <span className="col-span-5 text-sm text-foreground flex items-center gap-2">
                {p.solved && <span className="text-neon-green text-xs">✓</span>}
                {p.title}
              </span>
              <span className="col-span-2 text-xs text-muted-foreground">{p.category}</span>
              <span className={`col-span-2 text-xs font-medium ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
              <span className="col-span-2 text-right text-xs text-muted-foreground">{p.points} pts</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Code Editor Preview */}
      <GlassCard className="p-5" tilt={false} glow="cyan">
        <h3 className="font-semibold text-foreground mb-3">Quick Code</h3>
        <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
          <div className="text-muted-foreground">
            <span className="text-neon-purple">function</span> <span className="text-neon-cyan">twoSum</span>(<span className="text-neon-orange">nums</span>, <span className="text-neon-orange">target</span>) {"{"}
          </div>
          <div className="text-muted-foreground pl-4">
            <span className="text-neon-purple">const</span> map = <span className="text-neon-purple">new</span> <span className="text-neon-cyan">Map</span>();
          </div>
          <div className="text-muted-foreground pl-4">
            <span className="text-neon-purple">for</span> (<span className="text-neon-purple">let</span> i = <span className="text-neon-orange">0</span>; i {"<"} nums.length; i++) {"{"}
          </div>
          <div className="text-muted-foreground pl-8">
            <span className="text-neon-purple">if</span> (map.has(target - nums[i]))
          </div>
          <div className="text-muted-foreground pl-12">
            <span className="text-neon-purple">return</span> [map.get(target - nums[i]), i];
          </div>
          <div className="text-muted-foreground pl-8">map.set(nums[i], i);</div>
          <div className="text-muted-foreground pl-4">{"}"}</div>
          <div className="text-muted-foreground">{"}"}</div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 text-sm rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            ▶ Run Code
          </button>
          <button className="px-4 py-2 text-sm rounded-lg glass text-foreground font-medium hover:border-primary/30 transition-colors">
            Submit
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Coding;
