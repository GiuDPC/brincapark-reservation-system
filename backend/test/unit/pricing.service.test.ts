import { describe, it, expect } from 'vitest';
import pricingService from '../../src/services/pricing.service';

describe('PricingService', () => {

    describe('isWeekend (lógica pura)', () => {

        it('debería retornar true para viernes (2024-01-05)', () => {
            expect(pricingService.isWeekend('2024-01-05')).toBe(true);
        });

        it('debería retornar true para sábado (2024-01-06)', () => {
            expect(pricingService.isWeekend('2024-01-06')).toBe(true);
        });

        it('debería retornar true para domingo (2024-01-07)', () => {
            expect(pricingService.isWeekend('2024-01-07')).toBe(true);
        });

        it('debería retornar false para lunes (2024-01-08)', () => {
            expect(pricingService.isWeekend('2024-01-08')).toBe(false);
        });

        it('debería retornar false para martes (2024-01-09)', () => {
            expect(pricingService.isWeekend('2024-01-09')).toBe(false);
        });

        it('debería retornar false para miércoles (2024-01-10)', () => {
            expect(pricingService.isWeekend('2024-01-10')).toBe(false);
        });
    });
});