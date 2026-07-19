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
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
    console.error("Could not connect to MongoDB. Check MONGODB_URI and network.");
    // Exit or propagate error so the developer is aware of connection issues
    throw err;
  }
};

module.exports = connectDB;