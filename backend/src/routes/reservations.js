// src/routes/reservations.js
const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// POST /api/reservations con esto podemos crear reserva pública
router.post('/', async (req, res) => {
  try {
    const { nombre, contacto, fechaVisita, numeroPersonas, actividad, notas } = req.body;

    if (!nombre || !contacto || !fechaVisita || !numeroPersonas) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const nuevaReserva = await Reservation.create({
      nombre,
      contacto,
      fechaVisita,
      numeroPersonas,
      actividad,
      notas
    });

    res.status(201).json(nuevaReserva);
  } catch (err) {
    console.error('Error creando reserva:', err);
    res.status(500).json({ error: 'Error interno al crear reserva' });
  }
});

module.exports = router;
