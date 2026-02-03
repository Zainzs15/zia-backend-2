import express from "express";
import morgan from "morgan";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

// Very permissive CORS: allow all origins and methods.
// This is what you asked for (even if not recommended for security).
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

app.use((err, _req, res) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
