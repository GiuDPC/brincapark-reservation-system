const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');



   //POST /api/reservations
   //Crear una nueva reserva pública (formulario del cliente)

router.post('/', async (req, res) => {
  try {
    const { 
      nombreCompleto,
      correo,
      telefono,
      paquete,
      fechaServicio,
      ciudad,
      estadoUbicacion,
      tipoEvento
    } = req.body;

    // Validación de campos obligatorios
    if (!nombreCompleto || !correo || !telefono || !paquete || !fechaServicio || !ciudad || !estadoUbicacion || !tipoEvento) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Crear la reserva en MongoDB
    const nuevaReserva = await Reservation.create({
      nombreCompleto,
      correo,
      telefono,
      paquete,
      fechaServicio,
      ciudad,
      estadoUbicacion,
      tipoEvento
    });

    return res.status(201).json(nuevaReserva);

  } catch (err) {
    console.error('Error creando reserva:', err);
    return res.status(500).json({ error: 'Error interno al crear reserva' });
  }
});




   //GET /api/reservations
   //Poder ver todas las reservas -> listar todas las reservas (solo vista admin)

router.get('/', async (req, res) => {
  try {
    const reservas = await Reservation.find().sort({ createdAt: -1 });
    return res.json(reservas);
  } catch (err) {
    console.error('Error al listar reservas:', err);
    return res.status(500).json({ error: "Error al obtener reservas" });
  }
});




   //GET /api/reservations/:id
  // Obtener una reserva específica por ID solo administrador

router.get('/:id', async (req, res) => {
  try {
    const reserva = await Reservation.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json(reserva);

  } catch (err) {
    console.error('Error buscando reserva por ID:', err);
    return res.status(500).json({ error: "Error al obtener reserva" });
  }
});




   //PUT /api/reservations/:id
   //Editar datos del formulario (estadoUbicacion, ciudad, paquete, etc.)
   //No toca el estado administrativo.

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const datosEditables = {
      nombreCompleto: req.body.nombreCompleto,
      correo: req.body.correo,
      telefono: req.body.telefono,
      paquete: req.body.paquete,
      fechaServicio: req.body.fechaServicio,
      ciudad: req.body.ciudad,
      estadoUbicacion: req.body.estadoUbicacion,
      tipoEvento: req.body.tipoEvento
    };

    const actualizada = await Reservation.findByIdAndUpdate(
      id,
      datosEditables,
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json(actualizada);

  } catch (err) {
    console.error('Error actualizando datos:', err);
    return res.status(500).json({ error: "Error al actualizar datos" });
  }
});




  //PUT /api/reservations/:id/estado
  // Cambiar el estado administrativo:
  //  - pendiente
  //  - aprobado
  //  - cancelado
  // solo los administradores pueden hacerlo
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoReserva } = req.body;

    const estadosValidos = ["pendiente", "aprobado", "cancelado"];
    if (!estadosValidos.includes(estadoReserva)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const actualizada = await Reservation.findByIdAndUpdate(
      id,
      { estadoReserva },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json(actualizada);

  } catch (err) {
    console.error('Error actualizando estado:', err);
    return res.status(500).json({ error: "Error al actualizar estado" });
  }
});




   //DELETE /api/reservations/:id
  // Eliminar reserva (solo los administradores pueden hacerlo)

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const eliminada = await Reservation.findByIdAndDelete(id);

    if (!eliminada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json({ mensaje: "Reserva eliminada correctamente", eliminada });

  } catch (err) {
    console.error('Error al eliminar reserva:', err);
    return res.status(500).json({ error: "Error al eliminar reserva" });
  }
});



module.exports = router;
