import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";

const router = express.Router();

// Clinic hours: 7 PM to 10 PM Pakistan time (UTC+5)
const CLINIC_START_HOUR = 19;
const CLINIC_END_HOUR = 22;
const SLOT_MINUTES = 15;
const CLINIC_TIMEZONE_OFFSET = "+05:00"; // Pakistan (PKT)

// ---------------- Helper Functions ----------------
function getDateKey(dateString) {
  if (dateString) return String(dateString).slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

async function getNextSlotForDate(dateKey) {
  const existingCount = await Appointment.countDocuments({ preferredDate: dateKey });
  const totalSlots = ((CLINIC_END_HOUR - CLINIC_START_HOUR) * 60) / SLOT_MINUTES;
  if (existingCount >= totalSlots) return null;

  // Use explicit timezone so 7–10 PM is in Pakistan time, not server UTC
  const startTimeStr = `${dateKey}T${String(CLINIC_START_HOUR).padStart(2, "0")}:00:00${CLINIC_TIMEZONE_OFFSET}`;
  const startTime = new Date(startTimeStr);
  const slotStart = new Date(startTime.getTime() + existingCount * SLOT_MINUTES * 60 * 1000);
  const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);

  return {
    slotStart,
    slotEnd,
    patientNumber: existingCount + 1,
  };
}

// ---------------- Routes ----------------

// GET all appointments
router.get("/", async (_req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 }).lean();
    res.json({ data: appointments });
  } catch (err) {
    console.error("GET /appointments error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// GET appointments by date
router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.find({ preferredDate: date.slice(0, 10) })
      .sort({ slotStart: 1 })
      .lean();
    res.json({ data: appointments });
  } catch (err) {
    console.error("GET /appointments/date/:date error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// GET appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).lean();
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json({ data: appointment });
  } catch (err) {
    console.error("GET /appointments/:id error:", err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

// CREATE appointment
router.post("/", async (req, res) => {
  console.log("POST /appointments body:", req.body);

  try {
    const { name, phone, preferredDate, concern, plan, method, amount, txnId } = req.body || {};

    if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });

    const dateKey = getDateKey(preferredDate);
    const slot = await getNextSlotForDate(dateKey);
    if (!slot) return res.status(400).json({ error: "No slots available between 7 PM and 10 PM" });

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

    // Payment creation safely wrapped
    if (plan && amount && method) {
      try {
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
      } catch (paymentErr) {
        console.error("Payment creation failed:", paymentErr);
      }
    }

    res.status(201).json({ data: appointment });
  } catch (err) {
    console.error("POST /appointments error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE appointment
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return res.status(404).json({ error: "Appointment not found" });
    res.json({ data: updated });
  } catch (err) {
    console.error("PATCH /appointments/:id error:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// DELETE appointment
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted", data: deleted });
  } catch (err) {
    console.error("DELETE /appointments/:id error:", err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;
