import { Router } from "express";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";

const router = Router();
const JAZZCASH_NUMBER = "0305-2654324";

router.get("/", async (_req, res) => {
  try {
    const payments = await Payment.find()
      .populate("appointmentId", "name phone preferredDate patientNumber")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("appointmentId", "name phone preferredDate patientNumber")
      .lean();
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json({ data: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      amount,
      plan,
      name,
      phone,
      method,
      transactionId,
      appointmentId,
    } = req.body || {};

    if (!amount || !plan || !method) {
      return res
        .status(400)
        .json({ error: "amount, plan and method are required" });
    }

    const allowed = ["jazzcash", "sadapay", "nayapay", "credit", "debit"];
    if (!allowed.includes(method)) {
      return res.status(400).json({ error: "Unsupported payment method" });
    }

    if (appointmentId) {
      const appt = await Appointment.findById(appointmentId);
      if (!appt) {
        return res.status(404).json({ error: "Appointment not found" });
      }
    }

    const payment = await Payment.create({
      amount: Number(amount),
      plan,
      method,
      name: name || null,
      phone: phone || null,
      targetJazzCashNumber: JAZZCASH_NUMBER,
      transactionId: transactionId || null,
      appointmentId: appointmentId || null,
      status: "pending",
    });

    if (payment.appointmentId) {
      await payment.populate(
        "appointmentId",
        "name phone preferredDate patientNumber"
      );
    }

    res.status(201).json({ data: payment });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create payment" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (status && !["pending", "completed", "failed", "refunded"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (transactionId) updateData.transactionId = transactionId;

    const payment = await Payment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("appointmentId", "name phone preferredDate patientNumber")
      .lean();

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json({ data: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update payment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id).lean();
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json({ message: "Payment deleted", data: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

export default router;
