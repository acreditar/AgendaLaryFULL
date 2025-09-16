import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import PatientForm from "./PatientForm";
import PatientDetail from "./PatientDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface DashboardProps {
  patients: any[];
  setPatients: React.Dispatch<React.SetStateAction<any[]>>;
  createAppointment?: (patientId: string | number, payload: any) => Promise<any>;
  updateAppointment?: (patientId: string | number, appointmentId: string | number, payload: any) => Promise<any>;
  deleteAppointment?: (patientId: string | number, appointmentId: string | number) => Promise<void>;
}

export default function Dashboard({ patients, setPatients, onTabChange, createAppointment, updateAppointment, deleteAppointment }: DashboardProps & { onTabChange?: (tab: string) => void }) {
  const stats = [
    {
      title: "Pacientes Ativos",
      value: "24",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Consultas Hoje",
      value: "8",
      icon: Calendar,
      color: "text-accent"
    },
    {
      title: "Devolutivas Pendentes",
      value: "3",
      icon: FileText,
      color: "text-warning"
    },
    {
      title: "Relatórios Atrasados",
      value: "2",
      icon: AlertTriangle,
      color: "text-destructive"
    }
  ];

  // derive recent patients from the shared patients state (keep full objects)
  const recentPatients = patients.slice().sort((a, b) => {
    const da = isNaN(Date.parse(a.lastConsult)) ? 0 : new Date(a.lastConsult).getTime();
    const db = isNaN(Date.parse(b.lastConsult)) ? 0 : new Date(b.lastConsult).getTime();
    return db - da || b.id - a.id;
  }).slice(0, 3);

  const computeStatus = (p: any) => {
    if (p.checklistStatus === 'pendente' || p.checklistStatus === 'nao_iniciado') return 'checklist_pendente';
    if (p.evolutionStatus === 'pendente' || p.evolutionStatus === 'atrasada') return 'evolucao_pendente';
    return 'devolutiva_agendada';
  };

  const handleSavePatient = (patient: any) => {
    if (patient.id && patients.find((x: any) => x.id === patient.id)) {
      setPatients(patients.map(x => x.id === patient.id ? patient : x));
    } else {
      const newPatient = { ...patient, id: Date.now(), registrationDate: new Date().toISOString().split('T')[0], lastConsult: new Date().toISOString().split('T')[0], totalConsults: 0 };
      setPatients([...patients, newPatient]);
    }
  };

  // Simple schedule dialog component state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(patients.length ? patients[0].id : null);
  const [scheduledDate, setScheduledDate] = useState<string>("");

  const handleScheduleSave = () => {
    if (!selectedPatientId) return;
    setPatients(patients.map(p => p.id === selectedPatientId ? { ...p, nextAppointment: scheduledDate } : p));
    setScheduleOpen(false);
  };

  // derive reminders from patients: devolutiva pending or scheduled, evolutions pending, reports pending
  const reminders = patients.flatMap(p => {
    const items: any[] = [];
    if (p.devolutiveStatus === 'pendente') items.push({ type: 'devolutiva', patientName: p.name, patientId: p.id, due: p.nextAppointment ?? 'Não agendada' });
    if (p.evolutionStatus === 'pendente' || p.evolutionStatus === 'atrasada') items.push({ type: 'evolucao', patientName: p.name, patientId: p.id, due: p.lastConsult });
    // simple heuristic for report: if totalConsults > 0 and devolutive not concluded
    if (p.totalConsults > 0 && p.devolutiveStatus !== 'concluida') items.push({ type: 'relatorio', patientName: p.name, patientId: p.id, due: p.nextAppointment ?? 'Pendente' });
    return items;
  });

  const markReminderDone = (reminder: any) => {
    // update patient based on reminder type
    setPatients(patients.map(p => {
      if (p.id !== reminder.patientId) return p;
      if (reminder.type === 'devolutiva') return { ...p, devolutiveStatus: 'concluida' };
      if (reminder.type === 'evolucao') return { ...p, evolutionStatus: 'atualizada' };
      if (reminder.type === 'relatorio') return { ...p, devolutiveStatus: 'concluida' };
      return p;
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checklist_pendente":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Checklist Pendente</Badge>;
      case "evolucao_pendente":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Evolução Pendente</Badge>;
      case "devolutiva_agendada":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Devolutiva Agendada</Badge>;
      default:
        return <Badge variant="secondary">Em dia</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Gerencie sua agenda psicológica</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Hoje</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card hover:shadow-emphasis transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Pacientes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">Última consulta: {patient.lastConsult}</p>
                    <p className="text-sm text-muted-foreground">Próxima: {patient.nextAppointment}</p>
                  </div>
                  <div className="text-right space-y-2">
                    {getStatusBadge(computeStatus(patient))}
                    <div>
                      <PatientDetail
                        patient={patient}
                        onEdit={handleSavePatient}
                        onGenerateReport={(p) => { /* placeholder for report generation */ console.log('generate report for', p.name) }}
                        createAppointment={createAppointment}
                        updateAppointment={updateAppointment}
                        deleteAppointment={deleteAppointment}
                        trigger={<Button size="sm" variant="outline">Ver Perfil</Button>}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Lembretes Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reminders.map((reminder, index) => (
                <div key={`${reminder.patientId}-${index}`} className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {reminder.type === "devolutiva" && "Devolutiva"}
                      {reminder.type === "relatorio" && "Relatório"}
                      {reminder.type === "evolucao" && "Evolução"}
                    </p>
                    <p className="text-sm text-muted-foreground">{reminder.patientName}</p>
                    <p className="text-sm text-warning font-medium">Vence: {reminder.due}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => markReminderDone(reminder)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Marcar como Feito
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PatientForm
                onSave={handleSavePatient}
                trigger={
                  <Button className="h-20 flex flex-col gap-2" variant="outline">
                    <Users className="h-6 w-6" />
                    Novo Paciente
                  </Button>
                }
              />

              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogTrigger asChild>
                  <Button className="h-20 flex flex-col gap-2" variant="outline" onClick={() => { setSelectedPatientId(patients.length ? patients[0].id : null); setScheduledDate(""); setScheduleOpen(true); }}>
                    <Calendar className="h-6 w-6" />
                    Agendar Consulta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Agendar Consulta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Paciente</Label>
                      <select className="w-full p-2 border rounded" value={selectedPatientId ?? ''} onChange={(e) => setSelectedPatientId(Number(e.target.value))}>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Data</Label>
                      <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancelar</Button>
                      <Button onClick={handleScheduleSave}>Salvar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button className="h-20 flex flex-col gap-2" variant="outline" onClick={() => onTabChange ? onTabChange('reports') : null}>
                <FileText className="h-6 w-6" />
                Relatório Mensal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}