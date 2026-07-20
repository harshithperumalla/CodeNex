const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getEnglishProgress,
  completeLesson,
  saveSpeakingAttempt,
  completeDailyChallenge,
} = require("../controllers/englishController");

router.get("/progress", protect, getEnglishProgress);
router.post("/lesson-complete", protect, completeLesson);
router.post("/speaking-attempt", protect, saveSpeakingAttempt);
router.post("/daily-challenge", protect, completeDailyChallenge);

module.exports = router;
