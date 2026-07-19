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

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/mentor", require("./routes/mentorRoutes"));
app.use("/api/course", require("./routes/courseRoutes"));
app.use("/api/coding", require("./routes/codingRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/communication", require("./routes/communicationRoutes"));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});