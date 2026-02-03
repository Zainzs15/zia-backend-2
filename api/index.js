import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let ready = null;

async function ensureReady() {
  if (ready) return ready;
  ready = connectDB();
  return ready;
}

export default async function handler(req, res) {
  // Global CORS headers for all responses from this serverless function
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  // Handle preflight requests directly
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  await ensureReady();
  app(req, res);
}
