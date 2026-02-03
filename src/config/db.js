import mongoose from "mongoose";

// Prefer env var, but fall back to the hard-coded Atlas URI you provided.
// You should replace <zain_username> with your REAL PASSWORD before deploying.
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://zain_username:<zain_username>@cluster0.8ouvezp.mongodb.net/";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
