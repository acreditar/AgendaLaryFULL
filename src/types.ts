export type Id = string | number;

export interface Evolution {
    id: Id;
    date?: string;
    note?: string;
}

export interface Appointment {
    id: Id;
    date: string;
    note?: string;
    status?: string;
    completed?: boolean;
}

export interface ChecklistItem {
    id: Id;
    label: string;
    done: boolean;
}

export interface Patient {
    id: number; // current UI uses number ids; API accepts string | number
    name: string;
    email: string;
    phone: string;
    registrationDate: string; // ISO date YYYY-MM-DD
    lastConsult: string; // ISO date
    totalConsults: number;
    checklistStatus: 'completo' | 'pendente' | 'nao_iniciado';
    evolutionStatus: 'atualizada' | 'pendente' | 'atrasada';
    devolutiveStatus: 'agendada' | 'pendente' | 'concluida';
    nextAppointment?: string; // ISO date
    notes?: string;
    appointments?: Appointment[];
    evolutions?: Evolution[];
    checklistItems?: ChecklistItem[];
}

export type PatientUpdate = Partial<Patient>;
export type AppointmentInput = Partial<Appointment> & Record<string, unknown>;