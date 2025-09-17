import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import PatientDetail from '@/components/PatientDetail';
import { Badge } from '@/components/ui/badge';
import { todayDatePartBR, joinDateTime, splitISOish, isoishToBR, compareISOish } from '@/lib/datetime';
import TimePicker from '@/components/TimePicker';

import type { Patient, Appointment, Id, AppointmentInput } from '@/types';

interface Props {
  patients: Patient[];
  editPatient: (id: Id, p: Partial<Patient>) => Promise<unknown>;
  createAppointment?: (patientId: Id, payload: AppointmentInput) => Promise<unknown>;
  updateAppointment?: (patientId: Id, appointmentId: Id, payload: AppointmentInput) => Promise<unknown>;
  deleteAppointment?: (patientId: Id, appointmentId: Id) => Promise<void>;
}

export default function Agenda({ patients = [], editPatient, createAppointment, updateAppointment, deleteAppointment }: Props) {
  const todayISO = todayDatePartBR();

  const [selectedPatientId, setSelectedPatientId] = useState<string | "">("");
  const [date, setDate] = useState<string>("");
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | number | null>(null);
  const [status, setStatus] = useState<'agendado' | 'atendido' | 'nao_compareceu'>('agendado');

  const allAppointments = useMemo(() => {
    // flatten appointments with patient reference
    const list: { patientId: number; patientName: string; appointment: Appointment }[] = [];
    patients.forEach(p => {
      (p.appointments || []).forEach(a => list.push({ patientId: p.id, patientName: p.name, appointment: a }));
    });
    return list.sort((a, b) => compareISOish(a.appointment.date, b.appointment.date));
  }, [patients]);

  const todays = allAppointments.filter(x => typeof x.appointment.date === 'string' && x.appointment.date.startsWith(todayISO));
  const upcoming = allAppointments.filter(x => typeof x.appointment.date === 'string' && x.appointment.date >= todayISO);

  const handleSchedule = async () => {
    if (selectedPatientId === "" || !date) {
      alert('Selecione paciente e data');
      return;
    }
    const payload = { date, note: '', status: 'agendado', completed: false };
    if (typeof createAppointment === 'function') {
      await createAppointment(selectedPatientId, payload);
    } else {
      // fallback: update whole patient
      const newApp: Appointment = { id: Date.now(), date, note: '', completed: false, status: 'agendado' };
      const patient = patients.find(p => String(p.id) === String(selectedPatientId));
      if (!patient) {
        alert('Paciente não encontrado');
        return;
      }
      const updated = { ...patient, appointments: [...(patient.appointments || []), newApp], nextAppointment: date };
      await editPatient(patient.id, updated);
    }
    setSelectedPatientId("");
    setDate("");
    setEditingAppointmentId(null);
    setStatus('agendado');
  };

  const handleEdit = (patientId: Id, app: Appointment) => {
    setSelectedPatientId(String(patientId));
    setDate(app.date);
    setEditingAppointmentId(app.id);
    const st = (app.status ?? 'agendado') as 'agendado' | 'atendido' | 'nao_compareceu';
    setStatus(st);
  };

  const handleSaveEdit = async () => {
    if (selectedPatientId === "" || !editingAppointmentId) return;
    const payload = { date, note: '', status, completed: status === 'atendido' };
    if (typeof updateAppointment === 'function') {
      await updateAppointment(selectedPatientId, editingAppointmentId, payload);
    } else {
      const patient = patients.find(p => String(p.id) === String(selectedPatientId));
      if (!patient) {
        alert('Paciente não encontrado');
        return;
      }
      const apps = (patient.appointments || []).map(a => a.id === editingAppointmentId ? { ...a, date, status, note: a.note } : a);
      const nextAppointment = apps.length ? apps[apps.length - 1].date : undefined;
      const updated = { ...patient, appointments: apps, nextAppointment };
      await editPatient(patient.id, updated);
    }
    setSelectedPatientId("");
    setDate("");
    setEditingAppointmentId(null);
    setStatus('agendado');
  };

  const handleDelete = async (patientId: string | number, appId: string | number) => {
    if (!window.confirm('Remover agendamento?')) return;
    if (typeof deleteAppointment === 'function') {
      await deleteAppointment(patientId, appId);
    } else {
      const patient = patients.find(p => String(p.id) === String(patientId));
      if (!patient) return;
      const apps = (patient.appointments || []).filter(a => a.id !== appId);
      const nextAppointment = apps.slice(-1)[0]?.date;
      const updated = { ...patient, appointments: apps, nextAppointment };
      await editPatient(patient.id, updated);
    }
  };

  const handleMarkAttendance = async (patientId: string | number, appId: string | number, newStatus: 'atendido' | 'nao_compareceu') => {
    const payload = { status: newStatus === 'atendido' ? 'atendido' : 'nao_compareceu', completed: newStatus === 'atendido' };
    if (typeof updateAppointment === 'function') {
      await updateAppointment(patientId, appId, payload);
    } else {
      const patient = patients.find(p => String(p.id) === String(patientId));
      if (!patient) return;
      const apps = (patient.appointments || []).map(a => a.id === appId ? { ...a, status: newStatus, completed: newStatus === 'atendido' } : a);
      const next = apps.find(a => !a.completed && new Date(a.date) >= new Date())?.date;
      const updated = { ...patient, appointments: apps, nextAppointment: next };
      await editPatient(patient.id, updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">Gerencie seus agendamentos</p>
          </div>
        </div>

        {/* Scheduler Form */}
        <Card>
          <CardHeader>
            <CardTitle>Agendar Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label>Paciente</Label>
                <select className="w-full p-2 border rounded bg-card text-foreground" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
                  <option value="">Selecione...</option>
                  {patients.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="sched-date">Data</Label>
                  <Input id="sched-date" type="date" value={splitISOish(date).date} onChange={(e) => {
                    const d = e.target.value;
                    const t = splitISOish(date).time || '09:00';
                    setDate(d ? joinDateTime(d, t) : '');
                  }} />
                </div>
                <TimePicker id="sched-time" label="Hora" value={splitISOish(date).time} onChange={(t) => {
                  const d = splitISOish(date).date || todayISO;
                  setDate(t ? joinDateTime(d, t) : '');
                }} />
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full p-2 border rounded bg-card text-foreground" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="agendado">Agendado</option>
                  <option value="atendido">Atendido</option>
                  <option value="nao_compareceu">Não compareceu</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button onClick={editingAppointmentId ? handleSaveEdit : handleSchedule} className="min-w-[120px]">{editingAppointmentId ? 'Salvar' : 'Agendar'}</Button>
                {editingAppointmentId && <Button variant="outline" onClick={() => { setSelectedPatientId(""); setDate(""); setEditingAppointmentId(null); setStatus('agendado'); }}>Cancelar</Button>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoje ({todayISO})</CardTitle>
            </CardHeader>
            <CardContent>
              {todays.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma consulta agendada para hoje.</p>
              ) : (
                <div className="space-y-3">
                  {todays.map(item => (
                    <div key={item.appointment.id} className="p-3 border rounded bg-card/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="font-medium truncate">{item.patientName}</div>
                          <Badge variant={item.appointment.status === 'atendido' ? 'secondary' : item.appointment.status === 'nao_compareceu' ? 'destructive' : 'outline'} className="capitalize">{item.appointment.status || 'agendado'}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{isoishToBR(item.appointment.date)}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <PatientDetail
                          patient={patients.find(pt => pt.id === item.patientId)!}
                          onEdit={async (updated) => await editPatient(updated.id, updated)}
                          createAppointment={createAppointment}
                          updateAppointment={updateAppointment}
                          deleteAppointment={deleteAppointment}
                          trigger={<Button size="sm" variant="ghost">Abrir Prontuário</Button>}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma consulta agendada.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(item => (
                    <div key={item.appointment.id} className="p-3 border rounded bg-card/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="font-medium truncate">{item.patientName}</div>
                          <Badge variant={item.appointment.status === 'atendido' ? 'secondary' : item.appointment.status === 'nao_compareceu' ? 'destructive' : 'outline'} className="capitalize">{item.appointment.status || 'agendado'}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{isoishToBR(item.appointment.date)}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <PatientDetail
                          patient={patients.find(pt => pt.id === item.patientId)!}
                          onEdit={async (updated) => await editPatient(updated.id, updated)}
                          createAppointment={createAppointment}
                          updateAppointment={updateAppointment}
                          deleteAppointment={deleteAppointment}
                          trigger={<Button size="sm" variant="ghost">Abrir Prontuário</Button>}
                        />
                        <Button size="sm" variant="secondary" onClick={() => handleMarkAttendance(item.patientId, item.appointment.id, 'atendido')}>Compareceu</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleMarkAttendance(item.patientId, item.appointment.id, 'nao_compareceu')}>Não compareceu</Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item.patientId, item.appointment)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.patientId, item.appointment.id)}>Remover</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
