import { connectDB } from "./src/config/db.js";
import Appointment from "./src/models/Appointment.js";
import Payment from "./src/models/Payment.js";

async function main() {
  await connectDB();

  const apptCount = await Appointment.countDocuments();
  if (apptCount > 0) {
    console.log("Seed skipped, appointments already exist in the database.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const slotStart = new Date(`${today}T19:00:00`);
  const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);

  const appt = await Appointment.create({
    name: "ZIA Clinic Test Patient",
    phone: "03001234567",
    preferredDate: today,
    concern: "Test appointment for admin panel",
    plan: "basic",
    patientNumber: 1,
    slotStart,
    slotEnd,
    status: "confirmed",
  });

  await Payment.create({
    amount: 600,
    plan: "basic",
    method: "jazzcash",
    name: appt.name,
    phone: appt.phone,
    transactionId: "SEED-TEST-001",
    appointmentId: appt._id,
    status: "completed",
  });

  console.log("Seeded 1 appointment and 1 payment.");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
