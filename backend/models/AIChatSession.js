const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    attachments: [
      {
        fileName: String,
        fileType: String,
        fileSize: Number,
        snippet: String,
      },
    ],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiChatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },
    provider: {
      type: String,
      default: "gemini",
    },
    messages: [chatMessageSchema],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIChatSession", aiChatSessionSchema);
