import Appointment from "./models/Appointment.js";
import Payment from "./models/Payment.js";

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

function slot(date, h, m) {
  const start = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
  const end = new Date(start.getTime() + 15 * 60000);
  return { slotStart: start, slotEnd: end };
}

export async function seedData() {
  const apptCount = await Appointment.countDocuments();
  if (apptCount > 0) {
    console.log("Seed skipped, data exists");
    return;
  }

  const s1 = slot(today, 19, 0);
  const s2 = slot(today, 19, 15);
  const s3 = slot(today, 19, 30);
  const s4 = slot(tomorrow, 19, 0);

  const appt1 = await Appointment.create({
    name: "Ahmed Khan",
    phone: "03001234567",
    preferredDate: today,
    concern: "Skin rash",
    plan: "basic",
    patientNumber: 1,
    ...s1,
    status: "confirmed",
  });

  const appt2 = await Appointment.create({
    name: "Sara Ali",
    phone: "03331234567",
    preferredDate: today,
    concern: "Digestive issues",
    plan: "premium",
    patientNumber: 2,
    ...s2,
    status: "pending",
  });

  const appt3 = await Appointment.create({
    name: "Fatima Noor",
    phone: "03219876543",
    preferredDate: today,
    concern: "Respiratory",
    plan: "basic",
    patientNumber: 3,
    ...s3,
    status: "completed",
  });

  const appt4 = await Appointment.create({
    name: "Usman Malik",
    phone: "03115551234",
    preferredDate: tomorrow,
    concern: "Joint pain",
    plan: "premium",
    patientNumber: 1,
    ...s4,
    status: "pending",
  });

  await Payment.create({
    amount: 600,
    plan: "basic",
    method: "jazzcash",
    name: "Ahmed Khan",
    phone: "03001234567",
    transactionId: "JZ123456",
    appointmentId: appt1._id,
    status: "completed",
  });

  await Payment.create({
    amount: 1000,
    plan: "premium",
    method: "sadapay",
    name: "Sara Ali",
    phone: "03331234567",
    appointmentId: appt2._id,
    status: "pending",
  });

  await Payment.create({
    amount: 600,
    plan: "basic",
    method: "nayapay",
    name: "Fatima Noor",
    phone: "03219876543",
    transactionId: "NP789012",
    appointmentId: appt3._id,
    status: "completed",
  });

  await Payment.create({
    amount: 1000,
    plan: "premium",
    method: "jazzcash",
    name: "Usman Malik",
    phone: "03115551234",
    appointmentId: appt4._id,
    status: "pending",
  });

  console.log("Seed done: 4 appointments, 4 payments");
}
