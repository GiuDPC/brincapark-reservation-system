import express from 'express';
const router = express.Router();
import reservationController from '../controllers/reservation.controller';

//rutas publicas
router.post('/', reservationController.create);
router.get('/', reservationController.getAll);
router.get('/:id', reservationController.getById);

//rutas protegidas
router.put('/:id', reservationController.update);
router.delete('/:id', reservationController.delete);

export default router;
