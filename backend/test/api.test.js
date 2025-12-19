//Test para la API de Brincapark

import { describe, it, expect } from 'vitest';
import request from 'supertest';

const API_URL = 'http://localhost:4000';

describe('API de Brincapark', () => {

    //para verificar que la api responda correctamente
    it('GET / deberia responder con status 200', async () => {
        const response = await request(API_URL).get('/');
        expect(response.status).toBe(200);
    });

    //verificar el endpoint de configuracion
    it('GET /api/config/precios deberia devolver precios', async () => {
        const response = await request(API_URL).get('/api/config/precios');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('moneda');
    });

    //verificar si reservations requiere auth
    it('GET /api/admin/reservas sin token deberia devolver 401', async () => {
        const response = await request(API_URL).get('/api/admin/reservas');
        expect(response.status).toBe(401);
    });

    //verificar que login con credenciales incorrecta falla
    it('POST /api/admin/login con codigo incorrecto deberia devolver 401', async () => {
        const response = await request(API_URL).post('/api/admin/login').send({
            secret: 'codigo incorrecto'
        });
        expect(response.status).toBe(401);
    });

    //verificar endpoint de analytics
    it('GET /api/reservations/analytics/stats deberia responder', async () => {
        const response = await request(API_URL)
            .get('/api/reservations/analytics/stats');
        // Puede ser 200 o 401 dependiendo de si requiere auth
        expect([200, 401]).toContain(response.status);
    });
    //verificar que se pueden listar reservaciones publicas
    it('GET /api/reservations deberia devolver array', async () => {
        const response = await request(API_URL).get('/api/reservations');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

});