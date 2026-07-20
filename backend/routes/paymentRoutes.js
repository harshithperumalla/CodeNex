const express = require("express");
const router = express.Router();
const {
  getPaymentConfig,
  createRazorpayOrder,
  verifyPayment,
  markPaymentFailed,
  getPaymentHistory,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/config", protect, getPaymentConfig);
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);
router.post("/failure", protect, markPaymentFailed);
router.get("/history", protect, getPaymentHistory);

module.exports = router;
