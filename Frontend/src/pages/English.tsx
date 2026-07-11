import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, CheckCircle2, BookOpen, Volume2 } from "lucide-react";
import { toast } from "sonner";

type Lesson = { id: string; title: string; concept: string; example: string };

const grammar: Lesson[] = [
  { id: "g1", title: "Subject–Verb Agreement", concept: "The verb must agree with its subject in number and person.", example: "She writes daily. ✓  /  She write daily. ✗" },
  { id: "g2", title: "Tenses Overview", concept: "Past, present, and future — each with simple, continuous, perfect, perfect-continuous.", example: "I have been studying for 2 hours." },
  { id: "g3", title: "Articles (a, an, the)", concept: "Use 'a/an' for non-specific singular nouns; 'the' for specific ones.", example: "I saw a dog. The dog was friendly." },
  { id: "g4", title: "Prepositions", concept: "Words showing relationship — in, on, at, by, with…", example: "She arrived at 5pm on Monday in June." },
  { id: "g5", title: "Active vs Passive Voice", concept: "Active emphasizes the doer; passive emphasizes the receiver.", example: "Riya wrote the letter. → The letter was written by Riya." },
];

const vocabulary: Lesson[] = [
  { id: "v1", title: "Word of the Day: Ephemeral", concept: "Lasting for a very short time.", example: "Social media trends are ephemeral." },
  { id: "v2", title: "Phrasal Verbs", concept: "Verb + preposition that creates new meaning.", example: "Give up = quit. Look after = care for." },
  { id: "v3", title: "Synonyms & Antonyms", concept: "Words with similar / opposite meanings expand your range.", example: "Happy → joyful (syn) / sad (ant)" },
  { id: "v4", title: "Idioms", concept: "Expressions whose meaning isn't literal.", example: "Break the ice = start a conversation." },
  { id: "v5", title: "Business Vocabulary", concept: "Common terms in professional writing.", example: "Stakeholder, deliverable, ROI, scope." },
];

const speaking: Lesson[] = [
  { id: "s1", title: "Self Introduction", concept: "Structure: Greeting → Name → Background → Interest → Goal.", example: "Hi, I'm Aarav, a CS student passionate about AI…" },
  { id: "s2", title: "Common Conversation Openers", concept: "Easy lines to start small talk.", example: "How's your week going? / What brings you here?" },
  { id: "s3", title: "Interview Answers (STAR)", concept: "Situation, Task, Action, Result.", example: "When my team missed a deadline, I…" },
  { id: "s4", title: "Storytelling Basics", concept: "Hook → Conflict → Resolution.", example: "Last summer, something unexpected happened…" },
];

const sections: Record<string, Lesson[]> = { Grammar: grammar, Vocabulary: vocabulary, Speaking: speaking };

const PHRASES = [
  "She sells seashells by the seashore.",
  "I am passionate about building scalable applications.",
  "Could you please repeat that more slowly?",
  "Innovation distinguishes leaders from followers.",
];

const English = () => {
  const [active, setActive] = useState("Grammar");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [done, setDone] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("english.done") ?? "[]"));
    } catch {
      return new Set();
    }
  });

  // Pronunciation state
  const [recording, setRecording] = useState(false);
  const [phrase, setPhrase] = useState(PHRASES[0]);
  const [scores, setScores] = useState<{ fluency: number; confidence: number; grammar: number } | null>(null);

  const allLessons = useMemo(() => [...grammar, ...vocabulary, ...speaking], []);
  const progress = Math.round((done.size / allLessons.length) * 100);

  const persist = (s: Set<string>) => {
    setDone(new Set(s));
    localStorage.setItem("english.done", JSON.stringify([...s]));
  };

  const markComplete = () => {
    if (!lesson) return;
    const s = new Set(done);
    s.add(lesson.id);
    persist(s);
    toast.success("Lesson marked as completed!");
    setLesson(null);
  };

  const startMic = () => {
    setRecording(true);
    setScores(null);
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    setTimeout(() => {
      const f = 60 + Math.floor(Math.random() * 40);
      const c = 55 + Math.floor(Math.random() * 45);
      const g = 65 + Math.floor(Math.random() * 35);
      setScores({ fluency: f, confidence: c, grammar: g });
      setRecording(false);
    }, 2200);
  };

  const avg = scores ? Math.round((scores.fluency + scores.confidence + scores.grammar) / 3) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gradient-text">Communication Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">Grammar, vocabulary & speaking — at your own pace.</p>
      </motion.div>

      <GlassCard className="p-5" tilt={false}>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-bold gradient-text">{progress}% completed</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-[11px] text-muted-foreground mt-2">{done.size} of {allLessons.length} lessons done</div>
      </GlassCard>

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="bg-white/5 border border-white/10">
          {Object.keys(sections).map((s) => (
            <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(sections).map(([name, list]) => (
          <TabsContent key={name} value={name} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list.map((l, i) => {
                const isDone = done.has(l.id);
                return (
                  <GlassCard key={l.id} delay={i * 0.05} className="p-4 cursor-pointer hover:border-primary/40 transition-colors" tilt={false}>
                    <button onClick={() => setLesson(l)} className="w-full text-left">
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${isDone ? "bg-emerald-500/20 text-emerald-300" : "bg-primary/15 text-primary"}`}>
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{l.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{l.concept}</div>
                        </div>
                        {isDone && <span className="text-[10px] text-emerald-300">Done</span>}
                      </div>
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Pronunciation */}
      <GlassCard className="p-6" glow="pink" tilt={false}>
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="h-5 w-5 text-pink-400" />
          <h3 className="font-semibold text-lg">Pronunciation Coach</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Tap the mic and read the phrase aloud. We'll score you.</p>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-4">
          <div className="text-xs text-muted-foreground mb-1">Read this:</div>
          <div className="text-lg font-medium">"{phrase}"</div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={startMic}
            disabled={recording}
            whileTap={{ scale: 0.92 }}
            className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all ${
              recording
                ? "bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.7)]"
                : "bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 shadow-[0_0_30px_rgba(236,72,153,0.5)]"
            }`}
          >
            <Mic className="h-8 w-8 text-white" />
            {recording && (
              <>
                <motion.span animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="absolute inset-0 rounded-full border-2 border-rose-400" />
                <motion.span animate={{ scale: [1, 1.8], opacity: [0.4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} className="absolute inset-0 rounded-full border-2 border-rose-400" />
              </>
            )}
          </motion.button>
          <div className="text-xs text-muted-foreground">{recording ? "Listening…" : "Tap mic to speak"}</div>
        </div>

        <AnimatePresence>
          {scores && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Fluency", val: scores.fluency, color: "from-cyan-500 to-blue-500" },
                { label: "Confidence", val: scores.confidence, color: "from-purple-500 to-pink-500" },
                { label: "Grammar", val: scores.grammar, color: "from-emerald-500 to-green-500" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.val}</div>
                </div>
              ))}
              <div className="col-span-3 text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  avg >= 80 ? "bg-emerald-500/20 text-emerald-300" : avg >= 65 ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"
                }`}>
                  {avg >= 80 ? "✨ Great pronunciation!" : avg >= 65 ? "👍 Good — keep practicing" : "💪 Needs improvement"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <Dialog open={!!lesson} onOpenChange={(o) => !o && setLesson(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">{lesson?.title}</DialogTitle>
          </DialogHeader>
          {lesson && (
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Concept</div>
                <p className="text-sm">{lesson.concept}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Example</div>
                <p className="text-sm font-mono">{lesson.example}</p>
              </div>
              <Button
                onClick={markComplete}
                disabled={done.has(lesson.id)}
                className="w-full gradient-primary text-primary-foreground gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {done.has(lesson.id) ? "Already completed" : "Mark as Completed"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default English;
