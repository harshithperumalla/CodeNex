const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getStudentProgress,
} = require("../controllers/mentorController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect, authorize("mentor", "admin"));

router.get("/dashboard", getDashboard);
router.get("/sessions", getSessions);
router.post("/sessions", createSession);
router.put("/sessions/:id", updateSession);
router.delete("/sessions/:id", deleteSession);
router.get("/students", getStudentProgress);

module.exports = router;
