let seq = 1;
export const appointments = [];
export const payments = [];

export function nextId() {
  return String(seq++);
}

export function addAppointment(data) {
  const id = nextId();
  const now = new Date();
  const doc = {
    _id: id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  appointments.push(doc);
  return doc;
}

export function findAppointment(id) {
  return appointments.find((a) => a._id === id);
}

export function updateAppointment(id, updates) {
  const i = appointments.findIndex((a) => a._id === id);
  if (i === -1) return null;
  appointments[i] = { ...appointments[i], ...updates, updatedAt: new Date() };
  return appointments[i];
}

export function removeAppointment(id) {
  const i = appointments.findIndex((a) => a._id === id);
  if (i === -1) return null;
  return appointments.splice(i, 1)[0];
}

export function addPayment(data) {
  const id = nextId();
  const now = new Date();
  const doc = {
    _id: id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  payments.push(doc);
  return doc;
}

export function findPayment(id) {
  return payments.find((p) => p._id === id);
}

export function updatePayment(id, updates) {
  const i = payments.findIndex((p) => p._id === id);
  if (i === -1) return null;
  payments[i] = { ...payments[i], ...updates, updatedAt: new Date() };
  return payments[i];
}

export function removePayment(id) {
  const i = payments.findIndex((p) => p._id === id);
  if (i === -1) return null;
  return payments.splice(i, 1)[0];
}
