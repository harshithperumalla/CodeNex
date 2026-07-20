const EnglishProgress = require("../models/EnglishProgress");

// Helper to format Date to YYYY-MM-DD
const formatDateKey = (d) => new Date(d).toISOString().split("T")[0];

// Helper to determine overall English level
const calculateOverallLevel = (completedCount, avgQuiz, avgSpeaking) => {
  const points = completedCount * 10 + (avgQuiz || 0) * 0.4 + (avgSpeaking || 0) * 0.5;
  if (points >= 120) return "Mastery";
  if (points >= 90) return "Advanced";
  if (points >= 60) return "Upper Intermediate";
  if (points >= 35) return "Intermediate";
  if (points >= 15) return "Elementary";
  return "Beginner";
};

// Helper to build 7-day weekly stats array
const buildWeeklyStats = (dailyStats) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    const dayLabel = dayNames[d.getDay()];

    const found = (dailyStats || []).find((s) => s.date === key);
    result.push({
      date: key,
      dayLabel,
      speakingTimeSeconds: found ? found.speakingTimeSeconds : 0,
      sessionsCount: found ? found.sessionsCount : 0,
      wordsSpokenTotal: found ? found.wordsSpokenTotal : 0,
    });
  }

  return result;
};

// GET /api/english/progress
exports.getEnglishProgress = async (req, res) => {
  try {
    let progress = await EnglishProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = await EnglishProgress.create({
        user: req.user._id,
        completedLessons: [],
        quizScores: {},
        speakingHistory: [],
        dailyPractice: {
          lastPracticeDate: null,
          streak: 0,
          completedChallenges: [],
        },
        longestStreak: 0,
        dailySpeakingStats: [],
        overallLevel: "Beginner",
      });
    }

    // Check daily streak reset
    const todayKey = formatDateKey(new Date());
    if (progress.dailyPractice && progress.dailyPractice.lastPracticeDate) {
      const last = new Date(progress.dailyPractice.lastPracticeDate);
      const now = new Date();
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        progress.dailyPractice.streak = 0;
        progress.dailyPractice.completedChallenges = [];
        await progress.save();
      } else if (diffDays === 1 && now.getDate() !== last.getDate()) {
        progress.dailyPractice.completedChallenges = [];
        await progress.save();
      }
    }

    // Keep longest streak updated
    if (progress.dailyPractice.streak > (progress.longestStreak || 0)) {
      progress.longestStreak = progress.dailyPractice.streak;
      await progress.save();
    }

    // Compute summary analytics
    const history = progress.speakingHistory || [];
    const totalSpeakingTimeSeconds = history.reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
    const longestSessionSeconds = history.reduce((max, h) => Math.max(max, h.durationSeconds || 0), 0);
    const activeDaysCount = (progress.dailySpeakingStats || []).filter((s) => s.speakingTimeSeconds > 0).length || 1;
    const averageDailySpeakingSeconds = Math.round(totalSpeakingTimeSeconds / activeDaysCount);

    const todayStat = (progress.dailySpeakingStats || []).find((s) => s.date === todayKey);
    const dailyTotalSpeakingSeconds = todayStat ? todayStat.speakingTimeSeconds : 0;
    const weeklySpeakingStats = buildWeeklyStats(progress.dailySpeakingStats);

    res.json({
      success: true,
      progress: {
        completedLessons: progress.completedLessons || [],
        quizScores: progress.quizScores || {},
        speakingHistory: [...(progress.speakingHistory || [])].reverse().slice(0, 30),
        dailyPractice: progress.dailyPractice || { streak: 0, completedChallenges: [] },
        longestStreak: progress.longestStreak || progress.dailyPractice?.streak || 0,
        dailyTotalSpeakingSeconds,
        totalSpeakingTimeSeconds,
        longestSessionSeconds,
        averageDailySpeakingSeconds,
        dailyGoalSeconds: 600, // 10 minutes goal
        weeklySpeakingStats,
        overallLevel: progress.overallLevel || "Beginner",
      },
    });
  } catch (err) {
    console.error("Error fetching English progress:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/english/lesson-complete
exports.completeLesson = async (req, res) => {
  try {
    const { lessonId, quizScore } = req.body;
    if (!lessonId) {
      return res.status(400).json({ success: false, message: "lessonId is required" });
    }

    let progress = await EnglishProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new EnglishProgress({ user: req.user._id });
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    if (quizScore !== undefined) {
      progress.quizScores.set(lessonId, Number(quizScore));
    }

    // Recalculate level
    const quizValues = Array.from(progress.quizScores.values());
    const avgQuiz = quizValues.length > 0 ? quizValues.reduce((a, b) => a + b, 0) / quizValues.length : 0;
    const speakingValues = progress.speakingHistory.map((s) => s.overallScore);
    const avgSpeaking = speakingValues.length > 0 ? speakingValues.reduce((a, b) => a + b, 0) / speakingValues.length : 0;

    progress.overallLevel = calculateOverallLevel(
      progress.completedLessons.length,
      avgQuiz,
      avgSpeaking
    );

    await progress.save();

    res.json({
      success: true,
      message: "Lesson progress saved!",
      completedLessons: progress.completedLessons,
      overallLevel: progress.overallLevel,
    });
  } catch (err) {
    console.error("Error saving lesson complete:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/english/speaking-attempt
exports.saveSpeakingAttempt = async (req, res) => {
  try {
    const {
      phrase,
      spokenText,
      durationSeconds,
      wordsSpoken,
      wpm,
      accuracy,
      pronunciation,
      fluency,
      confidence,
      overallScore,
      feedback,
      tips,
      diffResult,
    } = req.body;

    let progress = await EnglishProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new EnglishProgress({ user: req.user._id });
    }

    const durSec = Number(durationSeconds) || 0;
    const wCount = Number(wordsSpoken) || 0;
    const calculatedWPM = Number(wpm) || (durSec > 0 ? Math.round((wCount / durSec) * 60) : 0);

    progress.speakingHistory.push({
      phrase: phrase || "",
      spokenText: spokenText || "",
      durationSeconds: durSec,
      wordsSpoken: wCount,
      wpm: calculatedWPM,
      accuracy: accuracy || 0,
      pronunciation: pronunciation || 0,
      fluency: fluency || 0,
      confidence: confidence || 0,
      overallScore: overallScore || 0,
      feedback: feedback || "",
      tips: tips || [],
      diffResult: diffResult || [],
    });

    // Update Daily Speaking Stats & Streak
    const today = new Date();
    const todayKey = formatDateKey(today);

    let statIndex = (progress.dailySpeakingStats || []).findIndex((s) => s.date === todayKey);
    if (statIndex >= 0) {
      progress.dailySpeakingStats[statIndex].speakingTimeSeconds += durSec;
      progress.dailySpeakingStats[statIndex].sessionsCount += 1;
      progress.dailySpeakingStats[statIndex].wordsSpokenTotal += wCount;
    } else {
      progress.dailySpeakingStats.push({
        date: todayKey,
        speakingTimeSeconds: durSec,
        sessionsCount: 1,
        wordsSpokenTotal: wCount,
      });
    }

    // Update streak if first practice session today
    const lastDate = progress.dailyPractice.lastPracticeDate
      ? new Date(progress.dailyPractice.lastPracticeDate)
      : null;

    if (!lastDate) {
      progress.dailyPractice.streak = 1;
    } else {
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1 && today.getDate() !== lastDate.getDate()) {
        progress.dailyPractice.streak += 1;
      } else if (diffDays > 1) {
        progress.dailyPractice.streak = 1;
      }
    }
    progress.dailyPractice.lastPracticeDate = today;

    if (progress.dailyPractice.streak > (progress.longestStreak || 0)) {
      progress.longestStreak = progress.dailyPractice.streak;
    }

    // Update level
    const quizValues = Array.from(progress.quizScores.values());
    const avgQuiz = quizValues.length > 0 ? quizValues.reduce((a, b) => a + b, 0) / quizValues.length : 0;
    const speakingValues = progress.speakingHistory.map((s) => s.overallScore);
    const avgSpeaking = speakingValues.length > 0 ? speakingValues.reduce((a, b) => a + b, 0) / speakingValues.length : 0;

    progress.overallLevel = calculateOverallLevel(
      progress.completedLessons.length,
      avgQuiz,
      avgSpeaking
    );

    await progress.save();

    const history = progress.speakingHistory || [];
    const totalSpeakingTimeSeconds = history.reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
    const longestSessionSeconds = history.reduce((max, h) => Math.max(max, h.durationSeconds || 0), 0);
    const activeDaysCount = (progress.dailySpeakingStats || []).filter((s) => s.speakingTimeSeconds > 0).length || 1;
    const averageDailySpeakingSeconds = Math.round(totalSpeakingTimeSeconds / activeDaysCount);

    const todayStat = progress.dailySpeakingStats.find((s) => s.date === todayKey);
    const dailyTotalSpeakingSeconds = todayStat ? todayStat.speakingTimeSeconds : 0;
    const weeklySpeakingStats = buildWeeklyStats(progress.dailySpeakingStats);

    res.json({
      success: true,
      message: "Speaking score saved successfully!",
      speakingHistory: [...progress.speakingHistory].reverse().slice(0, 30),
      overallLevel: progress.overallLevel,
      dailyPractice: progress.dailyPractice,
      longestStreak: progress.longestStreak,
      dailyTotalSpeakingSeconds,
      totalSpeakingTimeSeconds,
      longestSessionSeconds,
      averageDailySpeakingSeconds,
      dailyGoalSeconds: 600,
      weeklySpeakingStats,
    });
  } catch (err) {
    console.error("Error saving speaking attempt:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/english/daily-challenge
exports.completeDailyChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;
    let progress = await EnglishProgress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new EnglishProgress({ user: req.user._id });
    }

    const today = new Date();
    const lastDate = progress.dailyPractice.lastPracticeDate
      ? new Date(progress.dailyPractice.lastPracticeDate)
      : null;

    if (!progress.dailyPractice.completedChallenges.includes(challengeId)) {
      progress.dailyPractice.completedChallenges.push(challengeId);
    }

    if (!lastDate) {
      progress.dailyPractice.streak = 1;
    } else {
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1 && today.getDate() !== lastDate.getDate()) {
        progress.dailyPractice.streak += 1;
      } else if (diffDays > 1) {
        progress.dailyPractice.streak = 1;
      }
    }
    progress.dailyPractice.lastPracticeDate = today;

    if (progress.dailyPractice.streak > (progress.longestStreak || 0)) {
      progress.longestStreak = progress.dailyPractice.streak;
    }

    await progress.save();

    res.json({
      success: true,
      dailyPractice: progress.dailyPractice,
      longestStreak: progress.longestStreak,
    });
  } catch (err) {
    console.error("Error updating daily challenge:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
