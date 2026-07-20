import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  CheckCircle2,
  BookOpen,
  Volume2,
  Sparkles,
  Flame,
  Award,
  AlertCircle,
  RotateCcw,
  Clock,
  Gauge,
  MessageSquare,
  BarChart3,
  Trophy,
  Zap,
  Check,
  TrendingUp,
  Activity,
  Target,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import {
  grammarLessons,
  vocabularyLessons,
  speakingLessons,
  SPEAKING_PHRASES,
  DAILY_CHALLENGES,
  Lesson,
} from "@/data/englishData";

// Types for Analytics & Diff
interface DiffToken {
  word: string;
  status: "correct" | "incorrect" | "missing";
  expectedWord?: string;
}

interface SpeakingScores {
  durationSeconds: number;
  wordsSpoken: number;
  wpm: number;
  accuracy: number;
  pronunciation: number;
  fluency: number;
  confidence: number;
  overallScore: number;
  feedback: string;
  tips: string[];
  diffResult: DiffToken[];
}

interface SpeakingHistoryItem {
  phrase: string;
  spokenText: string;
  durationSeconds?: number;
  wordsSpoken?: number;
  wpm?: number;
  accuracy: number;
  pronunciation: number;
  fluency: number;
  confidence: number;
  overallScore: number;
  feedback: string;
  tips: string[];
  diffResult: DiffToken[];
  createdAt: string;
}

interface WeeklyStat {
  date: string;
  dayLabel: string;
  speakingTimeSeconds: number;
  sessionsCount: number;
  wordsSpokenTotal: number;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Elementary: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Intermediate: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Upper Intermediate": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Advanced: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Mastery: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

// Formatter Helpers
const formatHHMMSS = (totalSec: number) => {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatMinSec = (sec: number) => {
  if (!sec || sec <= 0) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const English = () => {
  const [activeTab, setActiveTab] = useState("Grammar");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Backend State & Summary Analytics
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [speakingHistory, setSpeakingHistory] = useState<SpeakingHistoryItem[]>([]);
  const [dailyPractice, setDailyPractice] = useState<{ streak: number; completedChallenges: string[] }>({
    streak: 0,
    completedChallenges: [],
  });
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [dailyTotalSpeakingSeconds, setDailyTotalSpeakingSeconds] = useState<number>(0);
  const [totalSpeakingTimeSeconds, setTotalSpeakingTimeSeconds] = useState<number>(0);
  const [longestSessionSeconds, setLongestSessionSeconds] = useState<number>(0);
  const [averageDailySpeakingSeconds, setAverageDailySpeakingSeconds] = useState<number>(0);
  const [dailyGoalSeconds, setDailyGoalSeconds] = useState<number>(600); // 10 mins
  const [weeklySpeakingStats, setWeeklySpeakingStats] = useState<WeeklyStat[]>([]);
  const [overallLevel, setOverallLevel] = useState<string>("Beginner");
  const [loadingBackend, setLoadingBackend] = useState(true);

  // Quiz State
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Pronunciation Coach & Timer State
  const [phraseIndex, setPhraseIndex] = useState(0);
  const targetPhrase = SPEAKING_PHRASES[phraseIndex];
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [speakingScores, setSpeakingScores] = useState<SpeakingScores | null>(null);
  const [sessionSummaryOpen, setSessionSummaryOpen] = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const allLessons = useMemo(() => [...grammarLessons, ...vocabularyLessons, ...speakingLessons], []);
  const progressPercent = Math.round((completedLessons.size / allLessons.length) * 100);

  // Words & WPM live calculation
  const currentTranscript = liveTranscript || manualInput;
  const wordsSpokenLive = useMemo(() => {
    return currentTranscript.trim().split(/\s+/).filter(Boolean).length;
  }, [currentTranscript]);

  const liveWPM = useMemo(() => {
    if (recordingTime <= 0 || wordsSpokenLive <= 0) return 0;
    return Math.round((wordsSpokenLive / (recordingTime / 60)));
  }, [recordingTime, wordsSpokenLive]);

  // Fetch Progress & Analytics from MongoDB
  const fetchProgress = async () => {
    try {
      const res = await api.get("/english/progress");
      if (res.data.success && res.data.progress) {
        const p = res.data.progress;
        setCompletedLessons(new Set(p.completedLessons || []));
        setQuizScores(p.quizScores || {});
        setSpeakingHistory(p.speakingHistory || []);
        setDailyPractice({
          streak: p.dailyPractice?.streak || 0,
          completedChallenges: p.dailyPractice?.completedChallenges || [],
        });
        setLongestStreak(p.longestStreak || 0);
        setDailyTotalSpeakingSeconds(p.dailyTotalSpeakingSeconds || 0);
        setTotalSpeakingTimeSeconds(p.totalSpeakingTimeSeconds || 0);
        setLongestSessionSeconds(p.longestSessionSeconds || 0);
        setAverageDailySpeakingSeconds(p.averageDailySpeakingSeconds || 0);
        setDailyGoalSeconds(p.dailyGoalSeconds || 600);
        setWeeklySpeakingStats(p.weeklySpeakingStats || []);
        setOverallLevel(p.overallLevel || "Beginner");
      }
    } catch (err) {
      console.error("Failed to load English progress:", err);
    } finally {
      setLoadingBackend(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  // Web Speech API Check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) setMicSupported(false);
    }
  }, []);

  // Live Timer Interval
  useEffect(() => {
    if (recording) {
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [recording]);

  // Word-Level Diff Analysis
  const analyzeSpeechDiff = (target: string, spoken: string): { diffTokens: DiffToken[]; accuracy: number } => {
    const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
    const targetWords = target.split(/\s+/);
    const spokenWords = spoken.split(/\s+/);

    const diffTokens: DiffToken[] = [];
    let correctCount = 0;

    let spokenIdx = 0;
    for (let i = 0; i < targetWords.length; i++) {
      const tClean = cleanWord(targetWords[i]);
      let matched = false;

      for (let j = spokenIdx; j < Math.min(spokenWords.length, spokenIdx + 3); j++) {
        if (cleanWord(spokenWords[j]) === tClean) {
          matched = true;
          spokenIdx = j + 1;
          break;
        }
      }

      if (matched) {
        diffTokens.push({ word: targetWords[i], status: "correct" });
        correctCount++;
      } else if (spokenIdx < spokenWords.length) {
        diffTokens.push({
          word: spokenWords[spokenIdx] || targetWords[i],
          status: "incorrect",
          expectedWord: targetWords[i],
        });
        spokenIdx++;
      } else {
        diffTokens.push({ word: targetWords[i], status: "missing" });
      }
    }

    const accuracy = Math.round((correctCount / targetWords.length) * 100);
    return { diffTokens, accuracy };
  };

  // Generate AI Feedback & Tips
  const generateAIFeedback = (accuracy: number, diffTokens: DiffToken[], spoken: string) => {
    const missingCount = diffTokens.filter((t) => t.status === "missing").length;
    const incorrectCount = diffTokens.filter((t) => t.status === "incorrect").length;

    let feedback = "";
    const tips: string[] = [];

    if (accuracy >= 90) {
      feedback = "🌟 Outstanding pronunciation! Clear articulation, correct word stress, and natural pace.";
      tips.push("Try increasing your speech pace while maintaining rhythm.");
      tips.push("Practice longer complex sentences to master fluency.");
    } else if (accuracy >= 70) {
      feedback = "👍 Good effort! Clear speech, but a few words were mispronounced or omitted.";
      if (incorrectCount > 0) {
        const misspoken = diffTokens
          .filter((t) => t.status === "incorrect")
          .map((t) => t.expectedWord)
          .slice(0, 2);
        tips.push(`Focus on distinct syllable pronunciation for: ${misspoken.join(", ")}`);
      }
      if (missingCount > 0) {
        tips.push("Avoid skipping prepositions or small linking words.");
      }
    } else {
      feedback = "💪 Needs practice. Speak slowly, enunciate clearly, and ensure mic positioning.";
      tips.push("Listen to native examples first, then repeat aloud.");
      tips.push("Take a brief pause between phrases to maintain clarity.");
    }

    return { feedback, tips };
  };

  // Mic Recording Actions
  const startRecording = () => {
    setSpeakingScores(null);
    setLiveTranscript("");
    setManualInput("");
    setRecordingTime(0);

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Browser speech recognition unavailable. You can type below to evaluate!");
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setRecording(true);
        startTimeRef.current = Date.now();
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setLiveTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast.error(`Mic error: ${event.error || "Speech not recognized"}`);
        setRecording(false);
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Mic start failed:", err);
      toast.error("Could not start microphone.");
      setRecording(false);
    }
  };

  const stopRecording = async (overrideSpokenText?: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setRecording(false);

    const spokenText = (overrideSpokenText || liveTranscript || manualInput).trim();

    if (!spokenText) {
      toast.error("No speech detected. Please speak into the mic or type your answer.");
      return;
    }

    const durationSec = Math.max(1, recordingTime || Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));
    const wordsCount = spokenText.split(/\s+/).filter(Boolean).length;
    const finalWPM = Math.round((wordsCount / (durationSec / 60)));

    const { diffTokens, accuracy } = analyzeSpeechDiff(targetPhrase, spokenText);

    const confidence = Math.min(98, Math.max(60, accuracy + Math.floor(Math.random() * 8)));
    const targetWordCount = targetPhrase.split(" ").length;
    const fluency = Math.min(100, Math.round((Math.min(wordsCount, targetWordCount) / targetWordCount) * 100));
    const pronunciation = Math.round(accuracy * 0.75 + confidence * 0.25);
    const overallScore = Math.round((accuracy + pronunciation + fluency + confidence) / 4);

    const { feedback, tips } = generateAIFeedback(accuracy, diffTokens, spokenText);

    const scoreData: SpeakingScores = {
      durationSeconds: durationSec,
      wordsSpoken: wordsCount,
      wpm: finalWPM,
      accuracy,
      pronunciation,
      fluency,
      confidence,
      overallScore,
      feedback,
      tips,
      diffResult: diffTokens,
    };

    setSpeakingScores(scoreData);
    setSessionSummaryOpen(true);

    try {
      const res = await api.post("/english/speaking-attempt", {
        phrase: targetPhrase,
        spokenText,
        ...scoreData,
      });

      if (res.data.success) {
        setSpeakingHistory(res.data.speakingHistory || []);
        if (res.data.overallLevel) setOverallLevel(res.data.overallLevel);
        if (res.data.dailyPractice) setDailyPractice(res.data.dailyPractice);
        if (res.data.longestStreak !== undefined) setLongestStreak(res.data.longestStreak);
        if (res.data.dailyTotalSpeakingSeconds !== undefined) setDailyTotalSpeakingSeconds(res.data.dailyTotalSpeakingSeconds);
        if (res.data.totalSpeakingTimeSeconds !== undefined) setTotalSpeakingTimeSeconds(res.data.totalSpeakingTimeSeconds);
        if (res.data.longestSessionSeconds !== undefined) setLongestSessionSeconds(res.data.longestSessionSeconds);
        if (res.data.averageDailySpeakingSeconds !== undefined) setAverageDailySpeakingSeconds(res.data.averageDailySpeakingSeconds);
        if (res.data.weeklySpeakingStats) setWeeklySpeakingStats(res.data.weeklySpeakingStats);
        toast.success(`🎉 Session saved! Score: ${overallScore}%`);
      }
    } catch (err) {
      console.error("Failed to save speaking attempt:", err);
    }
  };

  // Lesson & Quiz Handlers
  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setQuizMode(false);
    setSelectedAnswers(lesson.quiz ? new Array(lesson.quiz.length).fill(-1) : []);
    setQuizSubmitted(false);
  };

  const handleSelectQuizAnswer = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    const next = [...selectedAnswers];
    next[qIdx] = oIdx;
    setSelectedAnswers(next);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedLesson) return;
    const quiz = selectedLesson.quiz || [];
    let correctCount = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) correctCount++;
    });

    const scorePercent = Math.round((correctCount / quiz.length) * 100);
    setQuizSubmitted(true);

    try {
      const res = await api.post("/english/lesson-complete", {
        lessonId: selectedLesson.id,
        quizScore: scorePercent,
      });

      if (res.data.success) {
        setCompletedLessons(new Set(res.data.completedLessons));
        if (res.data.overallLevel) setOverallLevel(res.data.overallLevel);
        toast.success(`🎓 Quiz submitted! Score: ${scorePercent}%`);
      }
    } catch (err) {
      toast.error("Failed to save quiz result");
    }
  };

  const handleMarkLessonDoneDirectly = async () => {
    if (!selectedLesson) return;
    try {
      const res = await api.post("/english/lesson-complete", {
        lessonId: selectedLesson.id,
      });

      if (res.data.success) {
        setCompletedLessons(new Set(res.data.completedLessons));
        if (res.data.overallLevel) setOverallLevel(res.data.overallLevel);
        toast.success("Lesson completed!");
        setSelectedLesson(null);
      }
    } catch (err) {
      toast.error("Failed to complete lesson");
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const res = await api.post("/english/daily-challenge", { challengeId });
      if (res.data.success) {
        setDailyPractice(res.data.dailyPractice);
        if (res.data.longestStreak !== undefined) setLongestStreak(res.data.longestStreak);
        toast.success("🔥 Challenge claimed!");
      }
    } catch (err) {
      toast.error("Failed to claim challenge");
    }
  };

  const totalWeeklySeconds = useMemo(() => {
    return weeklySpeakingStats.reduce((sum, s) => sum + s.speakingTimeSeconds, 0);
  }, [weeklySpeakingStats]);

  const maxWeeklySeconds = useMemo(() => {
    if (weeklySpeakingStats.length === 0) return 300;
    const maxVal = Math.max(...weeklySpeakingStats.map((s) => s.speakingTimeSeconds));
    return maxVal > 0 ? maxVal : 300;
  }, [weeklySpeakingStats]);

  const dailyGoalPercent = Math.min(100, Math.round((dailyTotalSpeakingSeconds / dailyGoalSeconds) * 100));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            English & Communication Skills
            <Badge className={`text-xs px-2.5 py-0.5 border ${levelColors[overallLevel] || "bg-primary/20"}`}>
              {overallLevel} Level
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Speech recognition, live transcript, WPM timer, sentence diff breakdown & grammar lessons.
          </p>
        </div>

        {/* Streaks Pill */}
        <div className="flex items-center gap-3 bg-card/60 border border-border/50 px-4 py-2 rounded-xl backdrop-blur-xl">
          <div className="flex items-center gap-1.5 text-neon-orange font-bold text-sm">
            <Flame className="w-5 h-5 fill-neon-orange animate-pulse" />
            {dailyPractice.streak} Day Streak
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5 text-neon-cyan font-bold text-xs">
            <Trophy className="w-4 h-4 text-neon-yellow" />
            Max: {longestStreak} Days
          </div>
        </div>
      </motion.div>

      {/* PROGRESS DASHBOARD STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Practice Time */}
        <GlassCard className="p-3.5 flex flex-col justify-between" tilt={false}>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-neon-cyan" /> Total Practice
          </div>
          <div className="text-base font-bold font-mono text-foreground mt-2">
            {formatHHMMSS(totalSpeakingTimeSeconds)}
          </div>
        </GlassCard>

        {/* Avg Daily Practice */}
        <GlassCard className="p-3.5 flex flex-col justify-between" tilt={false}>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-neon-green" /> Avg Daily
          </div>
          <div className="text-base font-bold font-mono text-neon-green mt-2">
            {formatMinSec(averageDailySpeakingSeconds)}
          </div>
        </GlassCard>

        {/* Longest Session */}
        <GlassCard className="p-3.5 flex flex-col justify-between" tilt={false}>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-neon-pink" /> Longest Session
          </div>
          <div className="text-base font-bold font-mono text-neon-pink mt-2">
            {formatMinSec(longestSessionSeconds)}
          </div>
        </GlassCard>

        {/* Current Streak */}
        <GlassCard className="p-3.5 flex flex-col justify-between" tilt={false}>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-neon-orange" /> Streak
          </div>
          <div className="text-base font-bold font-mono text-neon-orange mt-2">
            {dailyPractice.streak} Days
          </div>
        </GlassCard>

        {/* Daily Goal */}
        <GlassCard className="p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1" tilt={false}>
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-neon-purple" /> Daily Goal
            </span>
            <span className="font-mono text-neon-purple text-[10px] font-bold">{dailyGoalPercent}%</span>
          </div>
          <div className="mt-2 space-y-1">
            <Progress value={dailyGoalPercent} className="h-1.5" />
            <div className="text-[10px] text-muted-foreground font-mono text-right">
              {Math.round(dailyTotalSpeakingSeconds / 60)} / 10 Mins
            </div>
          </div>
        </GlassCard>
      </div>

      {/* WEEKLY PRACTICE TIME ANIMATED CHART & OVERALL PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-5 flex flex-col justify-between" tilt={false}>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neon-cyan" /> Weekly Practice Time (Past 7 Days)
              </span>
              <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">
                Total: {formatMinSec(totalWeeklySeconds)}
              </Badge>
            </div>

            {/* REAL ANIMATED CHART OR FRIENDLY EMPTY STATE */}
            {totalWeeklySeconds === 0 ? (
              <div className="my-4 p-6 border border-dashed border-border/60 rounded-xl text-center space-y-2 bg-black/20">
                <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">
                  No practice time recorded for this week yet.
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  Start your first speaking practice below to track daily minutes!
                </p>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-2 border-b border-border/40">
                {weeklySpeakingStats.map((stat, idx) => {
                  const heightPercent = Math.max(12, Math.round((stat.speakingTimeSeconds / maxWeeklySeconds) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-neon-cyan bg-black/80 px-1.5 py-0.5 rounded border border-border">
                        {formatMinSec(stat.speakingTimeSeconds)}
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="w-full bg-gradient-to-t from-neon-cyan/30 via-neon-purple to-neon-cyan rounded-t-md hover:brightness-125 transition-all shadow-md"
                      />
                      <span className="text-[10px] text-muted-foreground font-mono font-medium">{stat.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Module Completion</span>
            <span className="font-bold gradient-text">{progressPercent}% ({completedLessons.size}/{allLessons.length} lessons)</span>
          </div>
        </GlassCard>

        {/* Level Status Card */}
        <GlassCard className="p-5 flex flex-col justify-between" tilt={false}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-yellow" />
              <h3 className="font-semibold text-base">English Proficiency</h3>
            </div>
            <div className="p-3.5 border border-white/10 rounded-xl bg-black/30 space-y-1">
              <div className="text-xs text-muted-foreground">Current Level</div>
              <div className="text-xl font-bold gradient-text">{overallLevel}</div>
              <p className="text-[11px] text-muted-foreground/80 mt-1">
                Level increases dynamically as you complete lessons, quizzes, and speaking practice attempts.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground flex justify-between">
            <span>Streak: <strong className="text-foreground">{dailyPractice.streak} days</strong></span>
            <span>Max Streak: <strong className="text-foreground">{longestStreak} days</strong></span>
          </div>
        </GlassCard>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 flex-wrap">
          <TabsTrigger value="Grammar">Grammar</TabsTrigger>
          <TabsTrigger value="Vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="Speaking">Speaking Scenarios</TabsTrigger>
          <TabsTrigger value="Challenges">Daily Challenges</TabsTrigger>
          <TabsTrigger value="History">Speaking History</TabsTrigger>
        </TabsList>

        {/* LESSON LIST TABS */}
        {[
          { name: "Grammar", list: grammarLessons },
          { name: "Vocabulary", list: vocabularyLessons },
          { name: "Speaking", list: speakingLessons },
        ].map(({ name, list }) => (
          <TabsContent key={name} value={name} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list.map((l, i) => {
                const isDone = completedLessons.has(l.id);
                const score = quizScores[l.id];
                return (
                  <GlassCard
                    key={l.id}
                    delay={i * 0.05}
                    className="p-4 cursor-pointer hover:border-primary/40 transition-all"
                    tilt={false}
                  >
                    <button onClick={() => handleOpenLesson(l)} className="w-full text-left">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                            isDone ? "bg-emerald-500/20 text-emerald-300" : "bg-primary/15 text-primary"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                            <span>{l.title}</span>
                            {score !== undefined && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">
                                Quiz: {score}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{l.concept}</div>
                        </div>
                        {isDone && <span className="text-[10px] text-emerald-300 font-semibold">Done</span>}
                      </div>
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          </TabsContent>
        ))}

        {/* DAILY CHALLENGES TAB */}
        <TabsContent value="Challenges" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DAILY_CHALLENGES.map((ch) => {
              const isDone = dailyPractice.completedChallenges.includes(ch.id);
              return (
                <GlassCard key={ch.id} className="p-5 flex flex-col justify-between" tilt={false}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-neon-purple/20 text-neon-purple text-xs">
                        +{ch.points} XP
                      </Badge>
                      {isDone && <span className="text-xs text-emerald-400 font-semibold">Done Today ✓</span>}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{ch.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{ch.description}</p>
                  </div>
                  <Button
                    disabled={isDone}
                    onClick={() => handleCompleteChallenge(ch.id)}
                    className="mt-4 w-full text-xs gradient-primary text-primary-foreground gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isDone ? "Completed" : "Claim Challenge"}
                  </Button>
                </GlassCard>
              );
            })}
          </div>
        </TabsContent>

        {/* SPEAKING HISTORY TAB */}
        <TabsContent value="History" className="mt-4">
          {speakingHistory.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-sm space-y-2">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p>No speaking attempts recorded yet.</p>
              <p className="text-xs text-muted-foreground/70">
                Practice reading sentences in the Speaking Coach below to record your performance history!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {speakingHistory.map((item, idx) => (
                <GlassCard key={idx} className="p-4" tilt={false}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2">
                    <span className="font-medium text-xs text-muted-foreground">
                      "{item.phrase}"
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">
                        {item.durationSeconds || 0}s • {item.wpm || 0} WPM
                      </Badge>
                      <Badge className="bg-neon-purple/20 text-neon-purple text-xs">
                        Score: {item.overallScore}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-semibold">Spoken:</span> "{item.spokenText}"
                  </p>
                  <p className="text-xs text-emerald-400/90 mt-1">{item.feedback}</p>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* SPEAKING PRACTICE MODULE CARD */}
      <GlassCard className="p-6" glow="pink" tilt={false}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-pink-400" />
            <h3 className="font-semibold text-lg">Speaking Practice & Pronunciation Coach</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPhraseIndex((prev) => (prev + 1) % SPEAKING_PHRASES.length);
              setSpeakingScores(null);
              setLiveTranscript("");
            }}
            className="text-xs text-muted-foreground gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Next Phrase
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Tap the mic and read the target sentence aloud. Real-time browser speech recognition will track duration (HH:MM:SS), Words Spoken, WPM, and sentence accuracy.
        </p>

        {/* Target Sentence Box */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 mb-4 shadow-inner">
          <div className="text-xs text-muted-foreground mb-1">Target Sentence:</div>
          <div className="text-lg font-medium text-foreground">"{targetPhrase}"</div>
        </div>

        {/* LIVE METRICS (HH:MM:SS, Words Spoken, WPM) */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-neon-cyan" /> Recording Time
            </div>
            <div className="text-lg font-bold font-mono text-neon-cyan mt-0.5">
              {formatHHMMSS(recordingTime)}
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <MessageSquare className="w-3 h-3 text-neon-pink" /> Words Spoken
            </div>
            <div className="text-lg font-bold font-mono text-neon-pink mt-0.5">
              {wordsSpokenLive}
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Gauge className="w-3 h-3 text-neon-purple" /> Speech WPM
            </div>
            <div className="text-lg font-bold font-mono text-neon-purple mt-0.5">
              {liveWPM}
            </div>
          </div>
        </div>

        {/* LIVE TRANSCRIPT */}
        {(recording || liveTranscript) && (
          <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 p-3 mb-4 text-xs">
            <span className="text-neon-cyan font-semibold">Live Recognized Transcript: </span>
            <span className="text-foreground italic">"{liveTranscript || "Listening for speech..."}"</span>
          </div>
        )}

        {/* MIC RECORD BUTTON */}
        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={recording ? () => stopRecording() : startRecording}
            whileTap={{ scale: 0.92 }}
            className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all ${
              recording
                ? "bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.7)]"
                : "bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 shadow-[0_0_30px_rgba(236,72,153,0.5)]"
            }`}
          >
            {recording ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
            {recording && (
              <>
                <motion.span
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-rose-400"
                />
                <motion.span
                  animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute inset-0 rounded-full border-2 border-rose-400"
                />
              </>
            )}
          </motion.button>
          <div className="text-xs text-muted-foreground font-medium">
            {recording ? "Tap again to finish & generate session summary" : "Tap mic to start speaking"}
          </div>
        </div>

        {/* FALLBACK INPUT */}
        {!micSupported && (
          <div className="mt-4 p-3 border border-amber-500/30 bg-amber-500/10 rounded-xl space-y-2">
            <div className="text-xs text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Speech recognition API unavailable in browser. Type your spoken text:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Type phrase as spoken..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground"
              />
              <Button size="sm" onClick={() => stopRecording(manualInput)} className="gradient-primary text-xs">
                Evaluate
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* SESSION SUMMARY MODAL */}
      <Dialog open={sessionSummaryOpen} onOpenChange={setSessionSummaryOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" /> Speaking Session Summary
            </DialogTitle>
          </DialogHeader>

          {speakingScores && (
            <div className="space-y-4 text-sm mt-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">Duration</div>
                  <div className="text-sm font-bold font-mono text-neon-cyan mt-0.5">
                    {formatHHMMSS(speakingScores.durationSeconds)}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">Words Spoken</div>
                  <div className="text-sm font-bold font-mono text-neon-pink mt-0.5">
                    {speakingScores.wordsSpoken}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">Speech Pace</div>
                  <div className="text-sm font-bold font-mono text-neon-purple mt-0.5">
                    {speakingScores.wpm} WPM
                  </div>
                </div>
              </div>

              {/* Word Diff */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-muted-foreground mb-2 font-semibold">
                  Word Accuracy Breakdown:
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  {speakingScores.diffResult.map((t, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 ${
                        t.status === "correct"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : t.status === "incorrect"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 line-through"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30 italic"
                      }`}
                    >
                      {t.word}
                      {t.status === "incorrect" && t.expectedWord && (
                        <span className="text-[10px] no-underline text-white font-normal ml-1">
                          ({t.expectedWord})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Accuracy", val: speakingScores.accuracy, color: "text-emerald-400" },
                  { label: "Pronunciation", val: speakingScores.pronunciation, color: "text-pink-400" },
                  { label: "Fluency", val: speakingScores.fluency, color: "text-cyan-400" },
                  { label: "Confidence", val: speakingScores.confidence, color: "text-purple-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    <div className={`text-xl font-bold ${s.color} mt-0.5`}>{s.val}%</div>
                  </div>
                ))}
              </div>

              {/* Feedback */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
                <div className="font-semibold text-pink-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400" /> AI Feedback & Insights
                </div>
                <p className="text-foreground">{speakingScores.feedback}</p>
                {speakingScores.tips.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Tips for Next Attempt:
                    </div>
                    {speakingScores.tips.map((tip, tIdx) => (
                      <div key={tIdx} className="text-muted-foreground flex items-start gap-1.5">
                        <span className="text-neon-cyan">•</span> {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={() => setSessionSummaryOpen(false)}
                className="w-full gradient-primary text-primary-foreground gap-2"
              >
                <Check className="w-4 h-4" /> Close & Continue Practice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* LESSON DIALOG */}
      <Dialog open={!!selectedLesson} onOpenChange={(o) => !o && setSelectedLesson(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl flex items-center justify-between">
              <span>{selectedLesson?.title}</span>
              {selectedLesson?.quiz && (
                <Button
                  size="sm"
                  onClick={() => setQuizMode(!quizMode)}
                  className="text-xs border border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
                >
                  {quizMode ? "View Lesson" : "Take Practice Quiz"}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedLesson && !quizMode && (
            <div className="space-y-4 text-sm mt-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                  Core Concept
                </div>
                <p className="text-foreground">{selectedLesson.concept}</p>
              </div>

              {selectedLesson.explanation && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                    Detailed Explanation
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{selectedLesson.explanation}</p>
                </div>
              )}

              {selectedLesson.rules && selectedLesson.rules.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1.5">
                  <div className="text-xs uppercase tracking-wider text-neon-cyan font-semibold">
                    Key Rules & Guidelines
                  </div>
                  {selectedLesson.rules.map((r, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-neon-cyan">•</span> {r}
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
                  Example
                </div>
                <p className="text-xs font-mono text-emerald-300">{selectedLesson.example}</p>
              </div>

              {selectedLesson.commonMistakes && selectedLesson.commonMistakes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Common Mistakes to Avoid
                  </div>
                  {selectedLesson.commonMistakes.map((m, mIdx) => (
                    <div key={mIdx} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs space-y-1">
                      <div className="text-rose-400 flex items-center gap-1.5">
                        <span className="font-bold">✗ Incorrect:</span> {m.incorrect}
                      </div>
                      <div className="text-emerald-300 flex items-center gap-1.5">
                        <span className="font-bold">✓ Correct:</span> {m.correct}
                      </div>
                      <div className="text-muted-foreground text-[11px]">Reason: {m.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                {selectedLesson.quiz && selectedLesson.quiz.length > 0 ? (
                  <Button
                    onClick={() => setQuizMode(true)}
                    className="w-full gradient-primary text-primary-foreground gap-2"
                  >
                    <Sparkles className="h-4 w-4" /> Start Interactive Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleMarkLessonDoneDirectly}
                    disabled={completedLessons.has(selectedLesson.id)}
                    className="w-full gradient-primary text-primary-foreground gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completedLessons.has(selectedLesson.id) ? "Already Completed" : "Mark as Completed"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* QUIZ MODE */}
          {selectedLesson && quizMode && selectedLesson.quiz && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Grammar Quiz: {selectedLesson.title}</span>
                <span>{selectedLesson.quiz.length} Questions</span>
              </div>

              {selectedLesson.quiz.map((q, qIdx) => (
                <div key={q.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="font-medium text-xs text-foreground">
                    {qIdx + 1}. {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[qIdx] === oIdx;
                      const isCorrect = q.correctAnswer === oIdx;

                      let btnStyle = "bg-black/30 border-white/10 hover:border-primary/40 text-muted-foreground";
                      if (quizSubmitted) {
                        if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                        else if (isSelected) btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
                      } else if (isSelected) {
                        btnStyle = "bg-primary/20 border-primary text-primary font-semibold";
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizAnswer(qIdx, oIdx)}
                          className={`w-full text-left text-xs p-3 rounded-lg border transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="text-[11px] text-muted-foreground border-t border-white/10 pt-2">
                      <span className="font-semibold text-foreground">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-2">
                {!quizSubmitted ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswers.includes(-1)}
                    className="w-full gradient-primary text-primary-foreground gap-2"
                  >
                    Submit Quiz Answers
                  </Button>
                ) : (
                  <Button
                    onClick={() => setSelectedLesson(null)}
                    className="w-full gradient-primary text-primary-foreground gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Finish & Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default English;
