import mongoose from "mongoose";

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is missing. Copy .env.example to .env and paste your MongoDB Atlas connection string."
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast instead of hanging if Atlas is unreachable
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    if (err.message.includes("bad auth")) {
      console.error("→ Check your username/password in MONGO_URI (Database Access in Atlas).");
    }
    if (err.message.includes("ETIMEDOUT") || err.message.includes("ENOTFOUND")) {
      console.error("→ Check Network Access in Atlas — your IP may not be allowlisted.");
    }
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected — attempting to reconnect...");
  });
}

export default connectDB;
