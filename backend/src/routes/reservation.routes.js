const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

//rutas publicas
router.post('/', reservationController.create);
router.get('/', reservationController.getAll);
router.get('/:id', reservationController.getById);

//rutas protegidas
router.put('/:id', reservationController.update);
router.delete('/:id', reservationController.delete);

module.exports = router;
