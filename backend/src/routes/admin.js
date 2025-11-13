// src/routes/admin.js
const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const adminAuth = require('../middleware/adminAuth');

router.use(adminAuth); // todas las rutas siguientes requieren header secreto

// GET /api/admin/reservas -> listar todas (ordenadas por creación desc)
router.get('/reservas', async (req, res) => {
  try {
    const all = await Reservation.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.error('Error obteniendo reservas:', err);
    res.status(500).json({ error: 'Error interno al obtener reservas' });
  }
});

// PATCH /api/admin/reservas/:id podemos cambiar estado
router.patch('/reservas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['pendiente','aprobado','cancelado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const reserva = await Reservation.findById(id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    reserva.estado = estado;
    await reserva.save();
    res.json(reserva);
  } catch (err) {
    console.error('Error actualizando reserva:', err);
    res.status(500).json({ error: 'Error interno al actualizar reserva' });
  }
});

// DELETE /api/admin/reservas/:id -> eliminar reserva
router.delete('/reservas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Reservation.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error eliminando reserva:', err);
    res.status(500).json({ error: 'Error interno al eliminar reserva' });
  }
});

module.exports = router;
