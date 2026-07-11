const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  getChatPartners
} = require("../controllers/communicationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/partners", getChatPartners);
router.get("/messages/:partnerId", getMessages);
router.post("/messages", sendMessage);

module.exports = router;
