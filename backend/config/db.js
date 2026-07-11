const mongoose = require("mongoose");
const dns = require("dns");

// Set DNS servers to Google DNS to fix querySrv ECONNREFUSED issues on some networks/OS configurations
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("ℹ️ DNS servers overridden to Google DNS (8.8.8.8, 8.8.4.4)");
} catch (dnsErr) {
  console.warn("⚠️ Failed to override DNS servers:", dnsErr.message);
}

const connectDB = async () => {
  const defaultLocal = "mongodb://127.0.0.1:27017/codenex";
  const uri = process.env.MONGODB_URI || defaultLocal;

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Full Error:");
    console.error(err);

    // If the initial URI was an Atlas SRV and DNS SRV lookup failed,
    // try a local fallback before exiting so the dev server can still run.
    if (uri !== defaultLocal) {
      console.log("Attempting fallback to local MongoDB at", defaultLocal);
      try {
        await mongoose.connect(defaultLocal);
        console.log("✅ MongoDB Connected (fallback local)");
        return;
      } catch (localErr) {
        console.error("❌ Local fallback also failed:");
        console.error(localErr);
      }
    }

    console.error("Could not connect to MongoDB. Check MONGODB_URI and network.");
    console.warn("Continuing without MongoDB connection — some features may fail.");
    // Do not exit process; allow the server to run in degraded mode for development.
    return;
  }
};

module.exports = connectDB;