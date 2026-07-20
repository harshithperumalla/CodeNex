const express = require("express");
const router = express.Router();
const { optionalProtect, protect } = require("../middleware/authMiddleware");
const {
  getSuggestions,
  createSuggestion,
  voteSuggestion,
} = require("../controllers/suggestionController");

router.get("/", optionalProtect, getSuggestions);
router.post("/", protect, createSuggestion);
router.post("/:id/vote", protect, voteSuggestion);

module.exports = router;
