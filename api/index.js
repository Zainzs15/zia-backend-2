import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let ready = null;

async function ensureReady() {
  if (ready) return ready;
  ready = connectDB();
  return ready;
}

export default async function handler(req, res) {
  await ensureReady();
  app(req, res);
}
