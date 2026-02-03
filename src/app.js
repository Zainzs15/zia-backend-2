import express from "express";
import morgan from "morgan";
import cors from "cors";

import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();
app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

// ✅ CORS CONFIG (FIX)
const corsOptions = {
  origin: "https://www.ziahomeopethic.online",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 👈 VERY IMPORTANT for Vercel

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// Test route
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZIA Clinic API" });
});

// Routes
app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
