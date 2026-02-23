import { describe, it, expect } from 'vitest';
import reservationService from '../../src/services/reservation.service';

import { IReservation } from '../../src/models/Reservation';

// Test simple del ReservationService (solo validaciones)
describe('ReservationService', () => {

    describe('validateReservation', () => {
        const validData: Partial<IReservation> = {
            nombreCompleto: 'Juan Pérez',
            correo: 'juan@email.com',
            telefono: '04241234567',
            paquete: 'mini',
            fechaServicio: '2024-01-15',
            horaReservacion: '10am-1pm',
            parque: 'Maracaibo'
        };

        it('debería pasar validación con datos válidos', () => {
            expect(() => {
                reservationService.validateReservation(validData);
            }).not.toThrow();
        });

        it('debería lanzar error si el nombre es muy corto', () => {
            const invalidData = { ...validData, nombreCompleto: 'AB' };
            expect(() => {
                reservationService.validateReservation(invalidData);
            }).toThrow('Nombre invalido');
        });

        it('debería lanzar error si el nombre está vacío', () => {
            const invalidData = { ...validData, nombreCompleto: '' };
            expect(() => {
                reservationService.validateReservation(invalidData);
            }).toThrow('Nombre invalido');
        });

        it('debería lanzar error si el email es inválido', () => {
            const invalidData = { ...validData, correo: 'no-es-email' };
            expect(() => {
                reservationService.validateReservation(invalidData);
            }).toThrow('correo');
        });

        it('debería lanzar error si el email no tiene @', () => {
            const invalidData = { ...validData, correo: 'emailsinArroba.com' };
            expect(() => {
                reservationService.validateReservation(invalidData);
            }).toThrow('correo');
        });

        it('debería lanzar error si el teléfono no tiene 11 dígitos', () => {
            const invalidData = { ...validData, telefono: '123' };
            expect(() => {
                reservationService.validateReservation(invalidData);
            }).toThrow('telefono');
        });

        it('debería lanzar error si el teléfono tiene letras', () => {
            const invalidData = { ...validData, telefono: '0424abc1234' };
            expect(() => {
                reservationService.validateReservation(invalidData);
            }).toThrow('telefono');
        });
    });
});