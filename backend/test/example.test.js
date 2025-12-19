import { describe, it, expect } from 'vitest';

describe('Matematicas basicas', () => {
    it('deberia sumar 2 + 2 = 4', () => {
        const resultado = 2 + 2;
        expect(resultado).toBe(4);
    })

});

it('deberia multiplicar 3 * 3 = 9', () => {
    const resultado = 3 * 3;
    expect(resultado).toBe(9);
});

it('deberia fallar 5 + 5 = 11', () => {
    const resultado = 5 + 5;
    expect(resultado).toBe(10);
})