/**
 * Quick standalone check: does MONGO_URI actually connect?
 * Run with: node scripts/testConnection.js
 * (Run this from inside the backend/ folder, after setting up .env)
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  console.log("Connecting to:", process.env.MONGO_URI ? "MONGO_URI found in .env" : "MONGO_URI MISSING");

  if (!process.env.MONGO_URI) {
    console.error("\n❌ .env file mein MONGO_URI nahi mila. .env.example ko .env mein copy karo pehle.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ Connected successfully to:", mongoose.connection.host);
    console.log("✅ Database name:", mongoose.connection.name);

    // Try a real write + read to confirm permissions are correct, not just network reachability
    const TestModel = mongoose.model("ConnectionTest", new mongoose.Schema({ checkedAt: Date }));
    const doc = await TestModel.create({ checkedAt: new Date() });
    console.log("✅ Test write successful, document id:", doc._id.toString());
    await TestModel.deleteOne({ _id: doc._id });
    console.log("✅ Test cleanup successful — Atlas connection is fully working.");
  } catch (err) {
    console.error("\n❌ Connection failed:", err.message);
    if (err.message.includes("bad auth")) {
      console.error("→ Username ya password galat hai. Atlas → Database Access mein check karo.");
    }
    if (err.message.includes("ETIMEDOUT") || err.message.includes("ENOTFOUND") || err.message.includes("querySrv")) {
      console.error("→ Network Access mein apna IP allowlist nahi hai, ya connection string galat copy hui hai.");
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testConnection();
