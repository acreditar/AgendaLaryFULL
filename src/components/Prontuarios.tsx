import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientDetail from "@/components/PatientDetail";
import { format } from "date-fns";
import type { Patient, Id, PatientUpdate, AppointmentInput } from '@/types';

interface Props {
    patients: Patient[];
    editPatient: (id: Id, p: PatientUpdate) => Promise<Patient> | Promise<unknown>;
    createAppointment?: (patientId: Id, payload: AppointmentInput) => Promise<unknown>;
    updateAppointment?: (patientId: Id, appointmentId: Id, payload: AppointmentInput) => Promise<unknown>;
    deleteAppointment?: (patientId: Id, appointmentId: Id) => Promise<void>;
}

export default function Prontuarios({ patients, editPatient, createAppointment, updateAppointment, deleteAppointment }: Props) {
    const handleEdit = async (updated: Patient) => {
        await editPatient(updated.id, updated);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Prontuários</h1>
                <p className="text-sm text-muted-foreground">Visão clínica dos prontuários — histórico e acessos rápidos.</p>
            </div>

            <div className="grid gap-4">
                {patients.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Nenhum paciente cadastrado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            Adicione pacientes na aba "Pacientes" para criar prontuários clínicos.
                        </CardContent>
                    </Card>
                )}

                {patients.map((p) => (
                    <Card key={p.id}>
                        <CardContent className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-lg font-medium">{p.name}</div>
                                <div className="text-sm text-muted-foreground">{p.email} • {p.phone}</div>
                                <div className="text-sm mt-2">
                                    Última consulta: {p.lastConsult ? format(new Date(p.lastConsult), 'dd/MM/yyyy') : '—'}
                                </div>
                                <div className="text-sm">
                                    Próxima consulta: {p.nextAppointment ? format(new Date(p.nextAppointment), 'dd/MM/yyyy') : 'Não agendada'}
                                </div>
                                <div className="text-sm mt-1 text-muted-foreground">{(p.evolutions || []).length} evoluções • {(p.appointments || []).length} agendamentos</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <PatientDetail
                                    patient={p}
                                    onEdit={handleEdit}
                                    createAppointment={createAppointment}
                                    updateAppointment={updateAppointment}
                                    deleteAppointment={deleteAppointment}
                                    onGenerateReport={() => { /* keep for future export hook */ }}
                                    trigger={<Button variant="outline">Abrir Prontuário</Button>}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
