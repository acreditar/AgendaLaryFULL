import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PatientList from '@/components/PatientList';
import React from 'react';

const basePatient = {
    id: 1,
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '(11) 99999-9999',
    registrationDate: '2024-01-10',
    lastConsult: '2024-01-15',
    totalConsults: 2,
    checklistStatus: 'completo',
    evolutionStatus: 'atualizada',
    devolutiveStatus: 'pendente',
    nextAppointment: undefined,
} as const;

describe('PatientList', () => {
    const addPatient = vi.fn().mockResolvedValue(undefined);
    const editPatient = vi.fn().mockResolvedValue(undefined);
    const removePatient = vi.fn().mockResolvedValue(undefined);

    const defaultProps = {
        patients: [basePatient],
        addPatient,
        editPatient,
        removePatient,
    };

    it('renders header and patient card', () => {
        render(<PatientList {...defaultProps} />);
        expect(screen.getByText('Prontuários')).toBeInTheDocument();
        expect(screen.getByText('Maria Silva')).toBeInTheDocument();
        expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    });

    it('filters by search input', () => {
        render(<PatientList {...defaultProps} />);
        const input = screen.getByPlaceholderText('Buscar por nome ou email...');
        fireEvent.change(input, { target: { value: 'joao' } });
        expect(screen.getByText('Nenhum paciente encontrado')).toBeInTheDocument();
        fireEvent.change(input, { target: { value: 'maria' } });
        expect(screen.queryByText('Nenhum paciente encontrado')).not.toBeInTheDocument();
    });
});
