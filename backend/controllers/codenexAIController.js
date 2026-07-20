const AIChatSession = require("../models/AIChatSession");
const { generateAIResponse } = require("../services/aiProviderService");
const mongoose = require("mongoose");

// Fallback guest user ID for unauthenticated visitors
const GUEST_USER_ID = new mongoose.Types.ObjectId("000000000000000000000000");

// GET /api/codenex-ai/sessions
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : GUEST_USER_ID;
    const sessions = await AIChatSession.find({ user: userId, isArchived: false })
      .select("title provider messages createdAt updatedAt")
      .sort({ updatedAt: -1 });

    const formatted = sessions.map((s) => ({
      id: s._id,
      _id: s._id,
      title: s.title || "New Conversation",
      provider: s.provider || "gemini",
      lastMessage: s.messages.length > 0 ? s.messages[s.messages.length - 1].content.slice(0, 60) : "",
      messagesCount: s.messages.length,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    res.json({ success: true, sessions: formatted });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.json({ success: true, sessions: [] });
  }
};

// POST /api/codenex-ai/session
exports.createSession = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user ? req.user._id : GUEST_USER_ID;

    const session = await AIChatSession.create({
      user: userId,
      title: title || "New Conversation",
      provider: process.env.AI_PROVIDER || "gemini",
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "👋 Hi! I am **CodeNex AI**, your dedicated AI Coding & Career Mentor.\n\nAsk me anything about **Coding, DSA, Debugging, Aptitude, English Communication, Resume Review, or HR/Tech Interviews**! 🚀",
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error("Error creating session:", err);
    res.json({
      success: true,
      session: {
        _id: `guest-session-${Date.now()}`,
        title: "New Conversation",
        provider: "gemini",
        messages: [],
      },
    });
  }
};

// GET /api/codenex-ai/session/:id
exports.getSessionById = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : GUEST_USER_ID;
    const session = await AIChatSession.findOne({ _id: req.params.id, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, session });
  } catch (err) {
    console.error("Error fetching session details:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/codenex-ai/session/:id
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : GUEST_USER_ID;
    const session = await AIChatSession.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/codenex-ai/chat
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, prompt, attachments = [], messages = [] } = req.body;
    const userId = req.user ? req.user._id : GUEST_USER_ID;

    if (!prompt && attachments.length === 0) {
      return res.status(400).json({ success: false, message: "Prompt or file attachment required" });
    }

    let session = null;
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await AIChatSession.findOne({ _id: sessionId, user: userId });
    }

    if (!session && mongoose.Types.ObjectId.isValid(sessionId) === false) {
      // Create session if missing
      try {
        session = await AIChatSession.create({
          user: userId,
          title: prompt ? prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "") : "File Analysis",
          provider: process.env.AI_PROVIDER || "gemini",
          messages: [],
        });
      } catch (e) {
        // Fallback for guest or DB issue
      }
    }

    if (!session) {
      try {
        session = await AIChatSession.create({
          user: userId,
          title: prompt ? prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "") : "New Conversation",
          provider: process.env.AI_PROVIDER || "gemini",
          messages: [],
        });
      } catch (e) {
        // Ignore DB save error for guests
      }
    }

    // Auto-update session title if default
    if (session && session.title === "New Conversation" && prompt) {
      session.title = prompt.slice(0, 32) + (prompt.length > 32 ? "..." : "");
    }

    // Attachment snippet string for AI context
    const attachmentContext = attachments
      .map((a) => `[File: ${a.fileName} (${a.fileType})]\n${a.snippet || ""}`)
      .join("\n\n");

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: prompt || "Attached files for analysis",
      attachments: attachments.map((a) => ({
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
        snippet: a.snippet ? a.snippet.slice(0, 200) : "",
      })),
      timestamp: new Date(),
    };

    if (session) {
      session.messages.push(userMsg);
    }

    // Call Provider Engine with message history
    const contextMessages = session ? session.messages : messages;
    const aiReplyText = await generateAIResponse({
      prompt: prompt || "Please analyze the attached files.",
      messages: contextMessages,
      attachmentContext,
    });

    const aiMsg = {
      id: `msg-${Date.now()}-a`,
      role: "assistant",
      content: aiReplyText,
      timestamp: new Date(),
    };

    if (session) {
      session.messages.push(aiMsg);
      await session.save();
    }

    res.json({
      success: true,
      sessionId: session ? session._id : `guest-${Date.now()}`,
      reply: aiReplyText,
      message: aiMsg,
      sessionTitle: session ? session.title : "Conversation",
    });
  } catch (err) {
    console.error("CodeNex AI chat error:", err);

    // Contextual fallback response so the client NEVER breaks
    const fallbackText = "👋 **CodeNex AI**: Thank you for asking! I can assist with Coding, DSA, Debugging, Aptitude, English Communication, and Resume Review. Please try asking your specific question or pasting your code!";

    res.json({
      success: true,
      reply: fallbackText,
      message: {
        id: `msg-${Date.now()}-f`,
        role: "assistant",
        content: fallbackText,
        timestamp: new Date(),
      },
    });
  }
};
