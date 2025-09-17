import { useState, useEffect } from "react";
import PatientList from "@/components/PatientList";
import Reports from "@/components/Reports";
import Agenda from "@/components/Agenda";
import Settings from "@/components/Settings";
import Prontuarios from "@/components/Prontuarios";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

import type { Patient, PatientUpdate, Id, AppointmentInput, Appointment } from '@/types';

import api from '@/lib/api';

const Index = () => {
  const [activeTab, setActiveTab] = useState("patients");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getPatients();
        if (mounted && Array.isArray(data)) setPatients(data);
      } catch (e) {
        console.error('failed to load patients from API', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // CRUD wrappers that call backend and update local state
  const addPatient = async (p: PatientUpdate) => {
    const created = await api.createPatient(p);
    setPatients(prev => [...prev, created]);
    return created;
  };

  const editPatient = async (id: Id, p: PatientUpdate) => {
    const updated = await api.updatePatient(id, p);
    setPatients(prev => prev.map(x => x.id === id ? { ...x, ...updated } : x));
    return updated;
  };

  const createAppointment = async (patientId: Id, payload: AppointmentInput) => {
    const appt = await api.createAppointment(patientId, payload);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, appointments: [...((p.appointments as Appointment[] | undefined) ?? []), appt], nextAppointment: appt.date } : p));
    return appt;
  };

  const updateAppointment = async (patientId: Id, appointmentId: Id, payload: AppointmentInput) => {
    const appt = await api.updateAppointment(patientId, appointmentId, payload);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, appointments: ((p.appointments as Appointment[] | undefined) ?? []).map(a => a.id === appointmentId ? appt : a) } : p));
    return appt;
  };

  const deleteAppointment = async (patientId: Id, appointmentId: Id) => {
    await api.deleteAppointment(patientId, appointmentId);
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, appointments: ((p.appointments as Appointment[] | undefined) ?? []).filter(a => a.id !== appointmentId) } : p));
  };

  const removePatient = async (id: Id) => {
    await api.deletePatient(id);
    setPatients(prev => prev.filter(x => x.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "patients":
        return <PatientList patients={patients} addPatient={addPatient} editPatient={editPatient} removePatient={removePatient} createAppointment={createAppointment} updateAppointment={updateAppointment} deleteAppointment={deleteAppointment} />;
      case "records":
        return <Prontuarios patients={patients} editPatient={editPatient} createAppointment={createAppointment} updateAppointment={updateAppointment} deleteAppointment={deleteAppointment} />;
      case "calendar":
        return <Agenda patients={patients} editPatient={editPatient} createAppointment={createAppointment} updateAppointment={updateAppointment} deleteAppointment={deleteAppointment} />;
      case "settings":
        return <Settings />;
      case "reports":
        return <Reports patients={patients} />;
      default:
        return <PatientList patients={patients} addPatient={addPatient} editPatient={editPatient} removePatient={removePatient} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
        <div>
          <h1 className="text-lg font-semibold">Agenda</h1>
          <p className="text-xs text-muted-foreground">Gestão Psicológica</p>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 max-w-[85vw] [&>button]:hidden">
            <MobileSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="md:flex md:h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <main className="flex-1 overflow-auto px-4 md:px-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
