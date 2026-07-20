const express = require("express");
const router = express.Router();
const { optionalProtect } = require("../middleware/authMiddleware");
const {
  getSessions,
  createSession,
  getSessionById,
  deleteSession,
  sendMessage,
} = require("../controllers/codenexAIController");

router.get("/sessions", optionalProtect, getSessions);
router.post("/session", optionalProtect, createSession);
router.get("/session/:id", optionalProtect, getSessionById);
router.delete("/session/:id", optionalProtect, deleteSession);
router.post("/chat", optionalProtect, sendMessage);

module.exports = router;
