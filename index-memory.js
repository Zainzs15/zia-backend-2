import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
  appointments,
  payments,
  addAppointment,
  findAppointment,
  updateAppointment,
  removeAppointment,
  addPayment,
  findPayment,
  updatePayment,
  removePayment,
} from "./src/store.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZIA Clinic API (memory mode)" });
});

function getNextSlot(dateKey) {
  const onDate = appointments.filter((a) => a.preferredDate === dateKey);
  const totalSlots = 12;
  if (onDate.length >= totalSlots) return null;
  const start = new Date(`${dateKey}T19:00:00`);
  const slotStart = new Date(start.getTime() + onDate.length * 15 * 60000);
  const slotEnd = new Date(slotStart.getTime() + 15 * 60000);
  return {
    slotStart,
    slotEnd,
    patientNumber: onDate.length + 1,
  };
}

app.get("/api/appointments", (_req, res) => {
  const list = [...appointments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ data: list });
});

app.get("/api/appointments/date/:date", (req, res) => {
  const list = appointments
    .filter((a) => a.preferredDate === req.params.date.slice(0, 10))
    .sort((a, b) => new Date(a.slotStart) - new Date(b.slotStart));
  res.json({ data: list });
});

app.get("/api/appointments/:id", (req, res) => {
  const appt = findAppointment(req.params.id);
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  res.json({ data: appt });
});

app.post("/api/appointments", (req, res) => {
  const body = req.body || {};
  const { name, phone, preferredDate, concern, plan, method, amount, txnId } =
    body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }
  const dateKey = (preferredDate || new Date().toISOString().slice(0, 10)).slice(
    0,
    10
  );
  const slot = getNextSlot(dateKey);
  if (!slot) {
    return res
      .status(400)
      .json({ error: "No slots available between 7 PM and 10 PM" });
  }
  const appt = addAppointment({
    name,
    phone,
    preferredDate: dateKey,
    concern: concern || "",
    plan: plan || "basic",
    patientNumber: slot.patientNumber,
    slotStart: slot.slotStart.toISOString(),
    slotEnd: slot.slotEnd.toISOString(),
    status: "pending",
  });
  if (plan && amount && method) {
    addPayment({
      name,
      phone,
      plan: plan || "basic",
      amount: Number(amount) || 600,
      method: method || "jazzcash",
      transactionId: txnId || null,
      appointmentId: appt._id,
      status: "pending",
    });
  }
  res.status(201).json({ data: appt });
});

app.patch("/api/appointments/:id", (req, res) => {
  const updated = updateAppointment(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Appointment not found" });
  res.json({ data: updated });
});

app.delete("/api/appointments/:id", (req, res) => {
  const removed = removeAppointment(req.params.id);
  if (!removed) return res.status(404).json({ error: "Appointment not found" });
  res.json({ message: "Appointment deleted", data: removed });
});

app.get("/api/payments", (_req, res) => {
  const list = [...payments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({ data: list });
});

app.get("/api/payments/:id", (req, res) => {
  const payment = findPayment(req.params.id);
  if (!payment) return res.status(404).json({ error: "Payment not found" });
  res.json({ data: payment });
});

app.post("/api/payments", (req, res) => {
  const body = req.body || {};
  const { amount, plan, method, name, phone, transactionId } = body;
  if (!amount || !plan || !method) {
    return res
      .status(400)
      .json({ error: "amount, plan and method are required" });
  }
  const allowed = ["jazzcash", "sadapay", "nayapay", "credit", "debit"];
  if (!allowed.includes(method)) {
    return res.status(400).json({ error: "Unsupported payment method" });
  }
  const payment = addPayment({
    amount: Number(amount),
    plan,
    method,
    name: name || null,
    phone: phone || null,
    transactionId: transactionId || null,
    status: "pending",
  });
  res.status(201).json({ data: payment });
});

app.patch("/api/payments/:id", (req, res) => {
  const { status } = req.body || {};
  if (
    status &&
    !["pending", "completed", "failed", "refunded"].includes(status)
  ) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const updated = updatePayment(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Payment not found" });
  res.json({ data: updated });
});

app.delete("/api/payments/:id", (req, res) => {
  const removed = removePayment(req.params.id);
  if (!removed) return res.status(404).json({ error: "Payment not found" });
  res.json({ message: "Payment deleted", data: removed });
});

function seed() {
  if (appointments.length > 0) {
    console.log("Seed skipped, data exists");
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const s1 = { slotStart: new Date(`${today}T19:00:00`), slotEnd: new Date(`${today}T19:15:00`), patientNumber: 1 };
  const s2 = { slotStart: new Date(`${today}T19:15:00`), slotEnd: new Date(`${today}T19:30:00`), patientNumber: 2 };

  const a1 = addAppointment({
    name: "Ahmed Khan",
    phone: "03001234567",
    preferredDate: today,
    concern: "Skin rash",
    plan: "basic",
    patientNumber: 1,
    slotStart: s1.slotStart.toISOString(),
    slotEnd: s1.slotEnd.toISOString(),
    status: "confirmed",
  });

  const a2 = addAppointment({
    name: "Sara Ali",
    phone: "03331234567",
    preferredDate: today,
    concern: "Digestive issues",
    plan: "premium",
    patientNumber: 2,
    slotStart: s2.slotStart.toISOString(),
    slotEnd: s2.slotEnd.toISOString(),
    status: "pending",
  });

  addPayment({
    amount: 600,
    plan: "basic",
    method: "jazzcash",
    name: "Ahmed Khan",
    phone: "03001234567",
    transactionId: "JZ123456",
    appointmentId: a1._id,
    status: "completed",
  });

  addPayment({
    amount: 1000,
    plan: "premium",
    method: "sadapay",
    name: "Sara Ali",
    phone: "03331234567",
    appointmentId: a2._id,
    status: "pending",
  });

  console.log("Seed done: 2 appointments, 2 payments");
}

seed();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} (memory mode)`);
});
