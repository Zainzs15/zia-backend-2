import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://ziaclinic:zia123456789@cluster0.67xeb5t.mongodb.net/zia-clinic?retryWrites=true&w=majority";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
