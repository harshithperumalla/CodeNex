const express = require("express");
const router = express.Router();
const { ask, chatWithAI } = require("../controllers/chatbotController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/ask", protect, authorize("admin"), ask);
router.post("/chat", protect, chatWithAI);

module.exports = router;
