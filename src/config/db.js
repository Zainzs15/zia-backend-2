import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://zain_username:hWVOKWfi7lPU2C45@cluster0.8ouvezp.mongodb.net/zia-clinic?retryWrites=true&w=majority";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // In serverless (Vercel), don't kill the process; just throw so the caller
    // can return a 500 response but still include CORS headers.
    throw err;
  }
}
