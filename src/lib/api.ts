import type { Id, PatientUpdate, AppointmentInput, Patient, Appointment } from '@/types';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  try {
    return await res.json();
  } catch {
    return null as unknown as T;
  }
}

export async function getPatients(): Promise<Patient[]> {
  const res = await fetch(`${BASE}/patients`);
  return handleRes<Patient[]>(res);
}

export async function createPatient(payload: PatientUpdate): Promise<Patient> {
  const res = await fetch(`${BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes<Patient>(res);
}

export async function updatePatient(id: Id, payload: PatientUpdate): Promise<Patient> {
  const res = await fetch(`${BASE}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes<Patient>(res);
}

export async function deletePatient(id: Id): Promise<unknown> {
  const res = await fetch(`${BASE}/patients/${id}`, { method: 'DELETE' });
  return handleRes<unknown>(res);
}

export async function createAppointment(patientId: Id, payload: AppointmentInput): Promise<Appointment> {
  const res = await fetch(`${BASE}/patients/${patientId}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes<Appointment>(res);
}

export async function updateAppointment(patientId: Id, appointmentId: Id, payload: AppointmentInput): Promise<Appointment> {
  const res = await fetch(`${BASE}/patients/${patientId}/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes<Appointment>(res);
}

export async function deleteAppointment(patientId: Id, appointmentId: Id): Promise<unknown> {
  const res = await fetch(`${BASE}/patients/${patientId}/appointments/${appointmentId}`, {
    method: 'DELETE',
  });
  return handleRes<unknown>(res);
}

export default { getPatients, createPatient, updatePatient, deletePatient, createAppointment, updateAppointment, deleteAppointment };
