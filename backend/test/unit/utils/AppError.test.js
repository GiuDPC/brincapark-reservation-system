import { describe, it, expect } from 'vitest';
import AppError from '../../../src/utils/AppError';

describe('AppError', () => {
    it('debería crear un error con mensaje y código de estado', () => {
        const error = new AppError('Test error', 400);

        expect(error.message).toBe('Test error');
        expect(error.statusCode).toBe(400);
        expect(error.isOperational).toBe(true);
    });

    it('debería ser una instancia de Error', () => {
        const error = new AppError('Test', 500);

        expect(error instanceof Error).toBe(true);
    });

    it('debería tener stack trace', () => {
        const error = new AppError('Test', 404);

        expect(error.stack).toBeDefined();
    });
});
