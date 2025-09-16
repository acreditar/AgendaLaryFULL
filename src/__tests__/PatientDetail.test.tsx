import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PatientDetail from '@/components/PatientDetail';
import { Button } from '@/components/ui/button';
import type { Patient } from '@/types';

const basePatient: Patient = {
    id: 1,
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    registrationDate: '2024-01-10',
    lastConsult: '2024-01-15',
    totalConsults: 2,
    checklistStatus: 'completo',
    evolutionStatus: 'atualizada',
    devolutiveStatus: 'pendente',
    nextAppointment: undefined,
    notes: '',
    appointments: [],
    evolutions: [],
};

describe('PatientDetail', () => {
    it('calls onEdit when clicking Editar', () => {
        const onEdit = vi.fn();
        render(
            <PatientDetail
                patient={basePatient}
                onEdit={onEdit}
                trigger={<Button>Open</Button>}
            />
        );

        fireEvent.click(screen.getByText('Open'));
        fireEvent.click(screen.getByText('Editar'));
        expect(onEdit).toHaveBeenCalled();
    });
});
