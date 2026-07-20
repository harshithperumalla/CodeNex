const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5153;

const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
        /\.onrender\.com$/.test(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /\.netlify\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

connectDB();

app.get("/", (_req, res) => {
  res.json({ success: true, message: "CodeNex API is running" });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const courseRoutes = require("./routes/courseRoutes");
const courseManagementRoutes = require("./routes/courseManagementRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const codingRoutes = require("./routes/codingRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const studentRoutes = require("./routes/studentRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
const englishRoutes = require("./routes/englishRoutes");
const codenexAIRoutes = require("./routes/codenexAIRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Standard /api routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/course-management", courseManagementRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/api/english", englishRoutes);
app.use("/api/codenex-ai", codenexAIRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/payment", paymentRoutes);

// Alias fallback routes without /api prefix for compatibility
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/mentor", mentorRoutes);
app.use("/course", courseRoutes);
app.use("/coding", codingRoutes);
app.use("/payment", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});