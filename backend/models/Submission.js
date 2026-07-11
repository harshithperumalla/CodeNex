const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    language: { type: String, default: "javascript" },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "wrong_answer", "runtime_error", "error"],
      default: "pending",
    },
    passedTests: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    runtimeMs: { type: Number, default: 0 },
    pointsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
