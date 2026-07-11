require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");

// Set DNS servers to Google DNS to fix querySrv ECONNREFUSED
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("DNS servers set to Google DNS");
} catch (e) {
  console.warn("Could not set DNS servers:", e);
}

const test = async () => {
  const uri = process.env.MONGODB_URI;
  console.log("Connecting to database:", uri);
  try {
    await mongoose.connect(uri);
    console.log("Mongoose Connected!");

    const db = mongoose.connection.db;
    const collection = db.collection("users");
    const indexes = await collection.indexes();
    console.log("Indexes on users collection:", JSON.stringify(indexes, null, 2));

  } catch (err) {
    console.error("Error encountered:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
};

test();
