import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Edit, Calendar, Plus } from "lucide-react";
import Checklist from "@/components/Checklist";
import { isoishToBR, splitISOish, joinDateTime, todayDatePartBR } from "@/lib/datetime";
import TimePicker from "@/components/TimePicker";

import type { Patient, Appointment, Id, AppointmentInput, ChecklistItem } from '@/types';


interface PatientDetailProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onGenerateReport?: (patient: Patient) => void;
  trigger: React.ReactNode;
  createAppointment?: (patientId: Id, payload: AppointmentInput) => Promise<unknown>;
  updateAppointment?: (patientId: Id, appointmentId: Id, payload: AppointmentInput) => Promise<unknown>;
  deleteAppointment?: (patientId: Id, appointmentId: Id) => Promise<void>;
}

export default function PatientDetail({ patient, onEdit, onGenerateReport, trigger, createAppointment, updateAppointment, deleteAppointment }: PatientDetailProps) {
  const [open, setOpen] = useState(false);
  const [evolution, setEvolution] = useState("");
  const [checkItems, setCheckItems] = useState<ChecklistItem[]>(patient.checklistItems || []);
  const [note, setNote] = useState(patient.notes || "");
  const [appointmentNote, setAppointmentNote] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const getStatusBadge = (status: string, type: string) => {
    const baseClasses = "text-xs font-medium";

    if (type === "checklist") {
      switch (status) {
        case "completo":
          return <Badge className={`${baseClasses} bg-success/10 text-success border-success/30`}>Completo</Badge>;
        case "pendente":
          return <Badge className={`${baseClasses} bg-warning/10 text-warning border-warning/30`}>Pendente</Badge>;
        case "nao_iniciado":
          return <Badge className={`${baseClasses} bg-muted/10 text-muted-foreground border-muted/30`}>Não Iniciado</Badge>;
      }
    }

    if (type === "evolution") {
      switch (status) {
        case "atualizada":
          return <Badge className={`${baseClasses} bg-success/10 text-success border-success/30`}>Atualizada</Badge>;
        case "pendente":
          return <Badge className={`${baseClasses} bg-warning/10 text-warning border-warning/30`}>Pendente</Badge>;
        case "atrasada":
          return <Badge className={`${baseClasses} bg-destructive/10 text-destructive border-destructive/30`}>Atrasada</Badge>;
      }
    }

    if (type === "devolutive") {
      switch (status) {
        case "concluida":
          return <Badge className={`${baseClasses} bg-success/10 text-success border-success/30`}>Concluída</Badge>;
        case "agendada":
          return <Badge className={`${baseClasses} bg-primary/10 text-primary border-primary/30`}>Agendada</Badge>;
        case "pendente":
          return <Badge className={`${baseClasses} bg-warning/10 text-warning border-warning/30`}>Pendente</Badge>;
      }
    }
  };

  const handleScheduleDevolutive = () => {
    const updated: Patient = { ...patient, devolutiveStatus: 'agendada' };
    onEdit(updated);
    setOpen(false);
  };

  const handleGenerateReport = () => {
    if (typeof onGenerateReport === 'function') onGenerateReport(patient);
    // optionally update patient status
    const updated: Patient = { ...patient, devolutiveStatus: 'concluida' };
    onEdit(updated);
    setOpen(false);
  };

  const handleAddEvolution = () => {
    if (!evolution) return;
    const newEvolution = { id: Date.now(), date: new Date().toISOString(), note: evolution };
    const updated: Patient = { ...patient, evolutions: [...(patient.evolutions || []), newEvolution] };
    onEdit(updated);
    setEvolution("");
  };

  const handleAddNote = () => {
    const updated: Patient = { ...patient, notes: note };
    onEdit(updated);
  };

  const handleAddAppointment = () => {
    if (!appointmentDate) return;
    const payload = { date: appointmentDate, note: appointmentNote, status: 'agendado', completed: false };
    if (typeof createAppointment === 'function') {
      createAppointment(patient.id, payload).then((appt) => {
        // optimistic update via onEdit
        const updatedAppointments: Appointment[] = [
          ...((patient.appointments as Appointment[] | undefined) ?? []),
          appt as Appointment,
        ];
        const updated: Patient = { ...patient, appointments: updatedAppointments, nextAppointment: (appt as Appointment).date };
        onEdit(updated);
      }).catch(err => console.error(err));
    } else {
      const newApp: Appointment = { id: Date.now(), date: appointmentDate, note: appointmentNote, completed: false };
      const updated: Patient = {
        ...patient, appointments: [
          ...((patient.appointments as Appointment[] | undefined) ?? []),
          newApp,
        ], nextAppointment: appointmentDate
      };
      onEdit(updated);
    }
    setAppointmentDate("");
    setAppointmentNote("");
  };

  const handleToggleAppointment = (appId: number) => {
    const apps: Appointment[] = ((patient.appointments as Appointment[] | undefined) ?? []).map(a => a.id === appId ? { ...a, completed: !a.completed } : a);
    const updated: Patient = { ...patient, appointments: apps as Appointment[] };
    onEdit(updated);
  };

  const handleDeleteEvolution = (evId: number) => {
    const evs = ((patient.evolutions as { id: Id }[] | undefined) ?? []).filter(e => e.id !== evId);
    const updated: Patient = { ...patient, evolutions: evs };
    onEdit(updated);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Prontuário - {patient.name}</DialogTitle>
            <Button variant="outline" size="sm" onClick={() => onEdit(patient)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
          <DialogDescription>
            Visualize dados, evoluções, checklist e agendamentos do paciente. Campos com rótulos claros e navegação por teclado.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
            <TabsTrigger value="devolutive">Devolutiva</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                    <p className="text-sm">{patient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{patient.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                    <p className="text-sm">{patient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cadastro</Label>
                    <p className="text-sm">{new Date(patient.registrationDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{patient.totalConsults}</p>
                    <p className="text-sm text-muted-foreground">Total de Consultas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Última Consulta</p>
                    <p className="font-medium">{new Date(patient.lastConsult).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Próxima Consulta</p>
                    <p className="font-medium">
                      {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString('pt-BR') : "Não agendada"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notas do Prontuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[120px]" />
                  <div className="flex justify-end">
                    <Button onClick={handleAddNote}>Salvar Notas</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <fieldset className="grid grid-cols-2 gap-2">
                    <legend className="sr-only">Novo agendamento</legend>
                    <div>
                      <Label htmlFor="appt-date">Data</Label>
                      <Input
                        id="appt-date"
                        type="date"
                        value={splitISOish(appointmentDate).date}
                        onChange={(e) => {
                          const d = e.target.value;
                          const t = splitISOish(appointmentDate).time || '09:00';
                          setAppointmentDate(d ? joinDateTime(d, t) : '');
                        }}
                      />
                    </div>
                    <TimePicker
                      id="appt-time"
                      label="Hora"
                      value={splitISOish(appointmentDate).time}
                      onChange={(t) => {
                        const d = splitISOish(appointmentDate).date || todayDatePartBR();
                        setAppointmentDate(t ? joinDateTime(d, t) : '');
                      }}
                    />
                    <div className="col-span-2">
                      <Label htmlFor="appt-note">Observação</Label>
                      <Input id="appt-note" placeholder="Opcional" value={appointmentNote} onChange={(e) => setAppointmentNote(e.target.value)} />
                    </div>
                  </fieldset>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleAddAppointment}>Adicionar Agendamento</Button>
                  </div>

                  <div className="space-y-2">
                    {((patient.appointments as Appointment[] | undefined) ?? []).map((a) => (
                      <AppointmentRow key={a.id} appointment={a} patient={patient} onEdit={onEdit} updateAppointment={updateAppointment} deleteAppointment={deleteAppointment} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Checklist</Label>
                    <div className="mt-1">{getStatusBadge(patient.checklistStatus, "checklist")}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Evolução</Label>
                    <div className="mt-1">{getStatusBadge(patient.evolutionStatus, "evolution")}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Devolutiva</Label>
                    <div className="mt-1">{getStatusBadge(patient.devolutiveStatus, "devolutive")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Checklist do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Checklist
                  items={checkItems}
                  onChange={(items) => {
                    setCheckItems(items);
                    const updated: Patient = { ...patient, checklistItems: items };
                    onEdit(updated);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evolution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="evolution">Nova Evolução</Label>
                  <Textarea
                    id="evolution"
                    placeholder="Descreva a evolução do paciente na sessão..."
                    value={evolution}
                    onChange={(e) => setEvolution(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Evolução
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devolutive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Devolutiva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Status: {getStatusBadge(patient.devolutiveStatus, "devolutive")}</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleScheduleDevolutive}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Devolutiva
                    </Button>
                    <Button variant="outline" onClick={handleGenerateReport}>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AppointmentRow({ appointment, patient, onEdit, updateAppointment, deleteAppointment }: { appointment: Appointment; patient: Patient; onEdit: (p: Patient) => void; updateAppointment?: (patientId: Id, appointmentId: Id, payload: AppointmentInput) => Promise<unknown>; deleteAppointment?: (patientId: Id, appointmentId: Id) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(appointment.date);
  const [note, setNote] = useState(appointment.note || "");

  const saveEdit = () => {
    const payload = { date, note };
    if (typeof updateAppointment === 'function') {
      updateAppointment(patient.id, appointment.id, payload).then((appt) => {
        const current: Appointment[] = (patient.appointments as Appointment[] | undefined) ?? [];
        const updatedAppointments: Appointment[] = current.map(x => x.id === appointment.id ? (appt as Appointment) : x);
        const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
        onEdit(updated);
      }).catch(err => console.error(err));
    } else {
      const current: Appointment[] = (patient.appointments as Appointment[] | undefined) ?? [];
      const updatedAppointments: Appointment[] = current.map(x => x.id === appointment.id ? ({ ...x, date, note } as Appointment) : x);
      const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
      onEdit(updated);
    }
    setEditing(false);
  };

  const remove = () => {
    if (typeof deleteAppointment === 'function') {
      deleteAppointment(patient.id, appointment.id).then(() => {
        const updatedAppointments: Appointment[] = (patient.appointments || []).filter(x => x.id !== appointment.id) as Appointment[];
        const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
        onEdit(updated);
      }).catch(err => console.error(err));
    } else {
      const updatedAppointments: Appointment[] = (patient.appointments || []).filter(x => x.id !== appointment.id) as Appointment[];
      const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
      onEdit(updated);
    }
  };

  const markAttended = () => {
    const payload = { status: 'atendido', completed: true };
    if (typeof updateAppointment === 'function') {
      updateAppointment(patient.id, appointment.id, payload).then((appt) => {
        const current: Appointment[] = (patient.appointments as Appointment[] | undefined) ?? [];
        const updatedAppointments: Appointment[] = current.map(x => x.id === appointment.id ? (appt as Appointment) : x);
        const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
        onEdit(updated);
      }).catch(err => console.error(err));
    } else {
      const current: Appointment[] = (patient.appointments as Appointment[] | undefined) ?? [];
      const updatedAppointments: Appointment[] = current.map(x => x.id === appointment.id ? ({ ...x, status: 'atendido', completed: true } as Appointment) : x);
      const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
      onEdit(updated);
    }
  };

  const markNoShow = () => {
    const payload = { status: 'nao_compareceu', completed: false };
    if (typeof updateAppointment === 'function') {
      updateAppointment(patient.id, appointment.id, payload).then((appt) => {
        const current: Appointment[] = (patient.appointments as Appointment[] | undefined) ?? [];
        const updatedAppointments: Appointment[] = current.map(x => x.id === appointment.id ? (appt as Appointment) : x);
        const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
        onEdit(updated);
      }).catch(err => console.error(err));
    } else {
      const current: Appointment[] = (patient.appointments as Appointment[] | undefined) ?? [];
      const updatedAppointments: Appointment[] = current.map(x => x.id === appointment.id ? ({ ...x, status: 'nao_compareceu', completed: false } as Appointment) : x);
      const updated: Patient = { ...patient, appointments: updatedAppointments } as Patient;
      onEdit(updated);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border p-2 rounded">
      <div className="flex-1">
        {!editing ? (
          <>
            <div className="font-medium">{isoishToBR(appointment.date)}</div>
            <div className="text-sm text-muted-foreground">{appointment.note || ''}</div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2 items-end">
            <div>
              <Label htmlFor={`edit-date-${appointment.id}`}>Data</Label>
              <Input id={`edit-date-${appointment.id}`} type="date" value={splitISOish(date).date} onChange={(e) => setDate(joinDateTime(e.target.value, splitISOish(date).time || '09:00'))} />
            </div>
            <TimePicker id={`edit-time-${appointment.id}`} label="Hora" value={splitISOish(date).time} onChange={(t) => setDate(joinDateTime(splitISOish(date).date || todayDatePartBR(), t))} />
            <div>
              <Label htmlFor={`edit-note-${appointment.id}`}>Obs.</Label>
              <Input id={`edit-note-${appointment.id}`} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!editing ? (
          <>
            <Button size="sm" variant={appointment.status === 'atendido' ? 'secondary' : 'outline'} onClick={markAttended}>Compareceu</Button>
            <Button size="sm" variant={appointment.status === 'nao_compareceu' ? 'destructive' : 'outline'} onClick={markNoShow}>Não compareceu</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Editar</Button>
            <Button size="sm" variant="destructive" onClick={remove}>Remover</Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={saveEdit}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
          </>
        )}
      </div>
    </div>
  );
}