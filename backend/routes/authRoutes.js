const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

console.log("signup:", typeof authController.signup);
console.log("login:", typeof authController.login);
console.log("forgotPassword:", typeof authController.forgotPassword);
console.log("getMe:", typeof authController.getMe);
console.log("protect:", typeof authMiddleware.protect);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/me", authMiddleware.protect, authController.getMe);

module.exports = router;