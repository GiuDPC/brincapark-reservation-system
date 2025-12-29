const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analytics.service');
const adminAuth = require('../middleware/adminAuth');

router.use(adminAuth);

// Estadísticas generales
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await analyticsService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Datos mensuales
router.get('/monthly', async (req, res, next) => {
    try {
        const data = await analyticsService.getMonthlyData();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// Top clientes
router.get('/top-clients', async (req, res, next) => {
    try {
        const topClientes = await analyticsService.getTopClients();
        res.json(topClientes);
    } catch (error) {
        next(error);
    }
});

// Análisis de cancelaciones
router.get('/cancellations', async (req, res, next) => {
    try {
        const analysis = await analyticsService.getCancellationAnalysis();
        res.json(analysis);
    } catch (error) {
        next(error);
    }
});

module.exports = router;