const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    problemId: { type: Number, unique: true, required: true },
    title: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Easy", "Medium", "Hard", "Expert"],
      required: true,
    },
    category: { type: String, default: "Arrays" },
    topicCategory: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    language: { type: String, default: "JavaScript" },
    description: { type: String, required: true },
    leetcodeLink: { type: String, default: "" },
    gfgLink: { type: String, default: "" },
    diagram: { type: String, default: "" },
    explanation: { type: String, default: "" },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [String],
    tags: [String],
    companies: [String],
    acceptance: { type: Number, default: 0 },
    points: { type: Number, default: 10 },
    starterCode: {
      javascript: String,
      python: String,
      java: String,
      cpp: String,
    },
    hints: [String],
    complexity: { type: String, default: "" },
    solutions: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
    concepts: [String],
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

problemSchema.index({ difficulty: 1, category: 1 });

module.exports = mongoose.model("Problem", problemSchema);
