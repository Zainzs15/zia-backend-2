import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { seedData } from "../src/seed.js";

let ready = null;

async function ensureReady() {
  if (ready) return ready;
  ready = connectDB().then(() => seedData());
  return ready;
}

export default async function handler(req, res) {
  await ensureReady();
  app(req, res);
}
