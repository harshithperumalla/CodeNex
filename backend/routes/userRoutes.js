const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getProfile,
  updateProfile,
  getLeaderboard,
  completeAptitude,
  completeDailyQuiz,
  completeTypingTest,
  getSessions,
  attendSession,
  getMentors,
  bookSession,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, getDashboard);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/leaderboard", getLeaderboard);
router.post("/aptitude/complete", protect, completeAptitude);
router.post("/daily-quiz/complete", protect, completeDailyQuiz);
router.post("/typing-test/complete", protect, completeTypingTest);
router.get("/sessions", protect, getSessions);
router.post("/sessions/:id/attend", protect, attendSession);
router.get("/mentors", protect, getMentors);
router.post("/sessions/book", protect, bookSession);

module.exports = router;
