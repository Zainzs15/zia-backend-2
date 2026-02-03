import express from "express";
import morgan from "morgan";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

// Allow ALL origins - no CORS restrictions
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZIA Clinic API" });
});

app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);

// Error handler (must have 4 parameters for Express to recognize it)
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

export default app;
