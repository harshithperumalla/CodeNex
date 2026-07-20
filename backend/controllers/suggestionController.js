const Suggestion = require("../models/Suggestion");

// GET /api/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .sort({ votes: -1, createdAt: -1 })
      .populate("user", "fullName name profileImageUrl");

    const userId = req.user ? req.user._id.toString() : null;

    const formatted = suggestions.map((s) => {
      const isVoted = userId ? s.voters.some((vId) => vId.toString() === userId) : false;
      return {
        id: s._id,
        _id: s._id,
        user: s.user ? (s.user.name || s.user.fullName) : s.userName || "Developer",
        title: s.title,
        description: s.description,
        votes: s.votes || 0,
        status: s.status || "review",
        category: s.category || "Feature",
        date: s.createdAt ? s.createdAt.toISOString().split("T")[0] : "",
        voted: isVoted,
      };
    });

    res.json({ success: true, suggestions: formatted });
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/suggestions
exports.createSuggestion = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: "Title, description, and category are required." });
    }

    const suggestion = await Suggestion.create({
      user: req.user._id,
      userName: req.user.name || req.user.fullName || "Developer",
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      status: "review",
      votes: 1,
      voters: [req.user._id],
    });

    res.status(201).json({
      success: true,
      message: "Suggestion submitted successfully!",
      suggestion: {
        id: suggestion._id,
        _id: suggestion._id,
        user: req.user.name || req.user.fullName,
        title: suggestion.title,
        description: suggestion.description,
        votes: suggestion.votes,
        status: suggestion.status,
        category: suggestion.category,
        date: suggestion.createdAt.toISOString().split("T")[0],
        voted: true,
      },
    });
  } catch (err) {
    console.error("Error creating suggestion:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/suggestions/:id/vote
exports.voteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ success: false, message: "Suggestion not found." });
    }

    const userId = req.user._id;
    const hasVoted = suggestion.voters.some((vId) => vId.toString() === userId.toString());

    if (hasVoted) {
      suggestion.voters = suggestion.voters.filter((vId) => vId.toString() !== userId.toString());
      suggestion.votes = Math.max(0, suggestion.votes - 1);
    } else {
      suggestion.voters.push(userId);
      suggestion.votes += 1;
    }

    await suggestion.save();

    res.json({
      success: true,
      votes: suggestion.votes,
      voted: !hasVoted,
    });
  } catch (err) {
    console.error("Error voting suggestion:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
