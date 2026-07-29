import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bags_ecommerce_db";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // Atlas needs more time than local
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      retryWrites: true,
      w: "majority",
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} → ${conn.connection.name}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });
  } catch (err) {
    console.error("❌ MongoDB initial connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
