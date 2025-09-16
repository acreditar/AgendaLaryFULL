export interface Evolution { id: number; date: string; note: string }
export interface Appointment { id: number; date: string; note?: string; completed?: boolean; status?: 'agendado' | 'atendido' | 'nao_compareceu' }

export interface Patient {
    id: number;
    name: string;
    email: string;
    phone: string;
    registrationDate: string;
    lastConsult: string;
    totalConsults: number;
    checklistStatus: 'completo' | 'pendente' | 'nao_iniciado';
    evolutionStatus: 'atualizada' | 'pendente' | 'atrasada';
    devolutiveStatus: 'agendada' | 'pendente' | 'concluida';
    nextAppointment?: string;
    notes?: string;
    evolutions?: Evolution[];
    appointments?: Appointment[];
}
