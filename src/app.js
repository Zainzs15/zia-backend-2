import express from "express";
import cors from "cors";
import morgan from "morgan";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

// Explicit CORS configuration so production domains can call the API
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://www.ziahomeopethic.online",
  "https://ziahomeopethic.online",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser / same-origin requests (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// Handle preflight for all routes
app.options("*", cors());

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZIA Clinic API" });
});

app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);

app.use((err, _req, res) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
