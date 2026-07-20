const mongoose = require("mongoose");

const speakingAttemptSchema = new mongoose.Schema(
  {
    phrase: { type: String, required: true },
    spokenText: { type: String, required: true },
    durationSeconds: { type: Number, default: 0 },
    wordsSpoken: { type: Number, default: 0 },
    wpm: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    pronunciation: { type: Number, default: 0 },
    fluency: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    tips: [{ type: String }],
    diffResult: [
      {
        word: String,
        status: { type: String, enum: ["correct", "incorrect", "missing"] },
        expectedWord: String,
      },
    ],
  },
  { timestamps: true }
);

const englishProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    completedLessons: [{ type: String }],
    quizScores: {
      type: Map,
      of: Number,
      default: {},
    },
    speakingHistory: [speakingAttemptSchema],
    dailyPractice: {
      lastPracticeDate: { type: Date, default: null },
      streak: { type: Number, default: 0 },
      completedChallenges: [{ type: String }],
    },
    longestStreak: { type: Number, default: 0 },
    dailySpeakingStats: [
      {
        date: { type: String }, // YYYY-MM-DD
        speakingTimeSeconds: { type: Number, default: 0 },
        sessionsCount: { type: Number, default: 0 },
        wordsSpokenTotal: { type: Number, default: 0 },
      },
    ],
    overallLevel: {
      type: String,
      enum: ["Beginner", "Elementary", "Intermediate", "Upper Intermediate", "Advanced", "Mastery"],
      default: "Beginner",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnglishProgress", englishProgressSchema);
