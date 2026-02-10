import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import analyticsService from '../services/analytics.service';
import adminAuth from '../middleware/adminAuth';

router.use(adminAuth);

// Estadísticas generales
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await analyticsService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Datos mensuales
router.get('/monthly', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await analyticsService.getMonthlyData();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// Top clientes
router.get('/top-clients', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topClientes = await analyticsService.getTopClients();
        res.json(topClientes);
    } catch (error) {
        next(error);
    }
});

// Análisis de cancelaciones
router.get('/cancellations', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const analysis = await analyticsService.getCancellationAnalysis();
        res.json(analysis);
    } catch (error) {
        next(error);
    }
});

export default router;