import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    plan: { type: String, enum: ["basic", "premium"], required: true },
    method: {
      type: String,
      enum: ["jazzcash", "sadapay", "nayapay", "credit", "debit"],
      required: true,
    },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    targetJazzCashNumber: { type: String, default: "0305-2654324" },
    transactionId: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1 });

export default mongoose.model("Payment", paymentSchema);
