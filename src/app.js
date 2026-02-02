import express from "express";
import cors from "cors";
import morgan from "morgan";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

app.use(cors());
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
