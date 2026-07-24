import express from 'express';
const router = express.Router();
import reservationController from '../controllers/reservation.controller';
import adminAuth from '../middleware/adminAuth';

//ruta publica
router.post('/', reservationController.create);

//rutas protegidas (admin)
router.get('/', adminAuth, reservationController.getAll);
router.get('/:id', adminAuth, reservationController.getById);
router.put('/:id', adminAuth, reservationController.update);
router.delete('/:id', adminAuth, reservationController.delete);

export default router;
