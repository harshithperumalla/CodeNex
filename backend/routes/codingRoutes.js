const express = require("express");
const router = express.Router();
const {
  getLanguages,
  getProblems,
  getProblemById,
  submitSolution,
  getMySubmissions,
  createProblem,
  runCode,
  verifyExternalSolution,
} = require("../controllers/codingController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/languages", getLanguages);
router.get("/problems", optionalProtect, getProblems);
router.get("/problems/:id", optionalProtect, getProblemById);
router.post("/problems/:id/run", protect, runCode);
router.post("/problems/:id/submit", protect, submitSolution);
router.post("/problems/:id/verify-external", protect, verifyExternalSolution);
router.get("/submissions", protect, getMySubmissions);

router.post("/problems", protect, authorize("admin"), createProblem);

module.exports = router;
