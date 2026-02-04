import express from "express";
import morgan from "morgan";
import cors from "cors";

import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

/* ✅ CORS CONFIG – allow frontend origins */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://ziahomeopethic.online",
  "https://www.ziahomeopethic.online",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // allow Vercel preview and production frontend URLs
      if (origin && (origin.endsWith(".vercel.app") || origin.startsWith("https://zia-"))) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

/* 🔥 VERY IMPORTANT FOR PREFLIGHT */
app.options("*", cors());

/* MIDDLEWARES */
app.use(express.json());
app.use(morgan("dev"));

/* ROOT */
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZIA Clinic API" });
});

/* ROUTES */
app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("Express error:", err.message);
  if (!res.headersSent) {
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

export default app;
