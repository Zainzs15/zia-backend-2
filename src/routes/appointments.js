import { Router } from "express";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";

const router = Router();
const CLINIC_START_HOUR = 19;
const CLINIC_END_HOUR = 22;
const SLOT_MINUTES = 15;

function getDateKey(dateString) {
  if (dateString) return String(dateString).slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

async function getNextSlotForDate(dateKey) {
  const existingCount = await Appointment.countDocuments({
    preferredDate: dateKey,
  });
  const totalSlots =
    ((CLINIC_END_HOUR - CLINIC_START_HOUR) * 60) / SLOT_MINUTES;
  if (existingCount >= totalSlots) return null;

  const startTime = new Date(
    `${dateKey}T${String(CLINIC_START_HOUR).padStart(2, "0")}:00:00`
  );
  const slotStart = new Date(
    startTime.getTime() + existingCount * SLOT_MINUTES * 60 * 1000
  );
  const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);
  return {
    slotStart,
    slotEnd,
    patientNumber: existingCount + 1,
  };
}

router.get("/", async (_req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.find({
      preferredDate: date.slice(0, 10),
    })
      .sort({ slotStart: 1 })
      .lean();
    res.json({ data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).lean();
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, preferredDate, concern, plan, method, amount, txnId } =
      req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const dateKey = getDateKey(preferredDate);
    const slot = await getNextSlotForDate(dateKey);
    if (!slot) {
      return res
        .status(400)
        .json({ error: "No slots available between 7 PM and 10 PM" });
    }

    const appointment = await Appointment.create({
      name,
      phone,
      preferredDate: dateKey,
      concern: concern || "",
      plan: plan || "basic",
      patientNumber: slot.patientNumber,
      slotStart: slot.slotStart,
      slotEnd: slot.slotEnd,
      status: "pending",
    });

    if (plan && amount && method) {
      await Payment.create({
        name,
        phone,
        plan: plan || "basic",
        amount: Number(amount) || 600,
        method: method || "jazzcash",
        transactionId: txnId || null,
        appointmentId: appointment._id,
        status: "pending",
      });
    }

    res.status(201).json({ data: appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id).lean();
    if (!deleted) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted", data: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;
