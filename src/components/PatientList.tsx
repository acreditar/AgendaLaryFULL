import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, FileText, Calendar, CheckCircle, AlertTriangle, User, Edit, Trash2 } from "lucide-react";
import PatientForm from "./PatientForm";
import PatientDetail from "./PatientDetail";
import type { Patient, PatientUpdate, Id, AppointmentInput } from "@/types";

interface PatientListProps {
  patients: Patient[];
  addPatient: (p: PatientUpdate) => Promise<Patient>;
  editPatient: (id: Id, p: PatientUpdate) => Promise<Patient>;
  removePatient: (id: Id) => Promise<void>;
  createAppointment?: (patientId: Id, payload: AppointmentInput) => Promise<unknown>;
  updateAppointment?: (patientId: Id, appointmentId: Id, payload: AppointmentInput) => Promise<unknown>;
  deleteAppointment?: (patientId: Id, appointmentId: Id) => Promise<void>;
}

export default function PatientList({ patients, addPatient, editPatient, removePatient, createAppointment, updateAppointment, deleteAppointment }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const handleSavePatient = async (patient: Patient) => {
    if (patient.id && patients.find(p => p.id === patient.id)) {
      // Update existing patient via API
      await editPatient(patient.id, patient);
    } else {
      // Add new patient via API
      const payload = {
        ...patient,
        registrationDate: new Date().toISOString().split('T')[0],
        lastConsult: new Date().toISOString().split('T')[0],
        totalConsults: 0
      };
      await addPatient(payload);
    }
  };

  const handleEditPatient = async (patient: Patient) => {
    await editPatient(patient.id, patient);
  };

  const handleDeletePatient = async (patientId: number) => {
    await removePatient(patientId);
  };

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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "todos") return matchesSearch;

    if (statusFilter === "checklist_pendente") {
      return matchesSearch && (patient.checklistStatus === "pendente" || patient.checklistStatus === "nao_iniciado");
    }

    if (statusFilter === "evolucao_pendente") {
      return matchesSearch && (patient.evolutionStatus === "pendente" || patient.evolutionStatus === "atrasada");
    }

    if (statusFilter === "devolutiva_pendente") {
      return matchesSearch && (patient.devolutiveStatus === "pendente");
    }

    return matchesSearch;
  });

  // Stats derived from patients
  const todayISO = new Date().toISOString().split('T')[0];
  const stats = {
    active: patients.length,
    consultationsToday: patients.filter(p => p.nextAppointment === todayISO).length,
    devolutivePending: patients.filter(p => p.devolutiveStatus === 'pendente').length,
    reportsOverdue: patients.filter(p => {
      // overdue if lastConsult older than 30 days and devolutive not concluded
      const last = Date.parse(p.lastConsult);
      if (isNaN(last)) return false;
      const days = (Date.now() - last) / (1000 * 60 * 60 * 24);
      return days > 30 && p.devolutiveStatus !== 'concluida';
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prontuários</h1>
            <p className="text-muted-foreground">Gerencie todos os seus pacientes</p>
          </div>
          <PatientForm onSave={handleSavePatient} trigger={<Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"><Plus className="h-4 w-4 mr-2" />Novo Paciente</Button>} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="shadow-card p-6 rounded-lg bg-card">
            <p className="text-sm font-medium text-muted-foreground">Pacientes Ativos</p>
            <p className="text-3xl font-bold text-foreground">{stats.active}</p>
          </div>
          <div className="shadow-card p-6 rounded-lg bg-card">
            <p className="text-sm font-medium text-muted-foreground">Consultas Hoje</p>
            <p className="text-3xl font-bold text-foreground">{stats.consultationsToday}</p>
          </div>
          <div className="shadow-card p-6 rounded-lg bg-card">
            <p className="text-sm font-medium text-muted-foreground">Devolutivas Pendentes</p>
            <p className="text-3xl font-bold text-foreground">{stats.devolutivePending}</p>
          </div>
          <div className="shadow-card p-6 rounded-lg bg-card">
            <p className="text-sm font-medium text-muted-foreground">Relatórios Atrasados</p>
            <p className="text-3xl font-bold text-foreground">{stats.reportsOverdue}</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="checklist_pendente">Checklist Pendente</SelectItem>
                  <SelectItem value="evolucao_pendente">Evolução Pendente</SelectItem>
                  <SelectItem value="devolutiva_pendente">Devolutiva Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patient Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="shadow-card hover:shadow-emphasis transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Cadastro: {new Date(patient.registrationDate).toLocaleDateString('pt-BR')}</p>
                    <p className="font-medium text-foreground">{patient.totalConsults} consultas</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Checklist</p>
                    {getStatusBadge(patient.checklistStatus, "checklist")}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Evolução</p>
                    {getStatusBadge(patient.evolutionStatus, "evolution")}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Devolutiva</p>
                    {getStatusBadge(patient.devolutiveStatus, "devolutive")}
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    <p>Última consulta: {new Date(patient.lastConsult).toLocaleDateString('pt-BR')}</p>
                    {patient.nextAppointment && (
                      <p>Próxima: {new Date(patient.nextAppointment).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <PatientDetail
                      patient={patient}
                      onEdit={handleEditPatient}
                      createAppointment={createAppointment}
                      updateAppointment={updateAppointment}
                      deleteAppointment={deleteAppointment}
                      trigger={
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Prontuário
                        </Button>
                      }
                    />
                    <PatientForm
                      patient={patient}
                      onSave={handleSavePatient}
                      trigger={
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={() => handleDeletePatient(patient.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum paciente encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}