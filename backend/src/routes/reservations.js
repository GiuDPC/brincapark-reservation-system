const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");

//POST /api/reservations
//Crear una nueva reserva pública formulario de cliente publico desde pagina principal

router.post("/", async (req, res) => {
  try {
    const {
      nombreCompleto,
      correo,
      telefono,
      paquete,
      fechaServicio,
      horaReservacion,
      parque,
      estadoUbicacion,
      tipoEvento,
    } = req.body;

    // Validación de campos obligatorios para crear reserva
    if (
      !nombreCompleto ||
      !correo ||
      !telefono ||
      !paquete ||
      !fechaServicio ||
      !horaReservacion ||
      !parque ||
      !estadoUbicacion ||
      !tipoEvento
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar duplicidad de reserva para mismo fecha, hora y parque
    const existe = await Reservation.findOne({
      fechaServicio,
      horaReservacion,
      parque,
    });
    if (existe) {
      return res
        .status(409)
        .json({ error: "El horario ya está ocupado en ese parque." });
    }

    // Validar lógica de paquetes y cantidades de personas por paquete
    let maxNinos = 0,
      maxAdultos = 0,
      maxTotal = 0;
    if (paquete === "mini") {
      maxNinos = 12;
      maxAdultos = 18;
      maxTotal = 30;
    } else if (paquete === "mediana") {
      maxNinos = 30;
      maxAdultos = 35;
      maxTotal = 65;
    } else if (paquete === "full") {
      maxNinos = 40;
      maxAdultos = 45;
      maxTotal = 85;
    }
    // Si se envían los campos de cantidad, validar aquí OPCIONAL

    // Crear la reserva a bases de datos mongoDB
    const nuevaReserva = await Reservation.create({
      nombreCompleto,
      correo,
      telefono,
      paquete,
      fechaServicio,
      horaReservacion,
      parque,
      estadoUbicacion,
      tipoEvento,
    });

    return res.status(201).json(nuevaReserva);
  } catch (err) {
    console.error("Error creando reserva:", err);
    return res.status(500).json({ error: "Error interno al crear reserva" });
  }
});

//GET /api/reservations
//Poder ver todas las reservas -> listar todas las reservas solo en el panel administrador

router.get("/", async (req, res) => {
  try {
    const reservas = await Reservation.find().sort({ createdAt: -1 });
    return res.json(reservas);
  } catch (err) {
    console.error("Error al listar reservas:", err);
    return res.status(500).json({ error: "Error al obtener reservas" });
  }
});

// GET /api/reservations/horarios-ocupados
// Endpoint para obtener horarios ocupados por fecha y parque
router.get("/horarios-ocupados", async (req, res) => {
  const { fechaServicio, parque } = req.query;
  if (!fechaServicio || !parque) {
    return res.status(400).json({ error: "Fecha y parque son requeridos." });
  }
  try {
    const reservas = await Reservation.find({ fechaServicio, parque });
    const horariosOcupados = reservas.map((r) => r.horaReservacion);
    res.json({ horariosOcupados });
  } catch (err) {
    res.status(500).json({ error: "Error al consultar horarios ocupados." });
  }
});

//GET /api/reservations/:id
// Obtener una reserva específica por id solo administrador

router.get("/:id", async (req, res) => {
  try {
    const reserva = await Reservation.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json(reserva);
  } catch (err) {
    console.error("Error buscando reserva por ID:", err);
    return res.status(500).json({ error: "Error al obtener reserva" });
  }
});

//PUT /api/reservations/:id
//Editar datos del formulario (estadoUbicacion, ciudad, paquete, etc.)
//No toca el estado administrativo.

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const datosEditables = {
      nombreCompleto: req.body.nombreCompleto,
      correo: req.body.correo,
      telefono: req.body.telefono,
      paquete: req.body.paquete,
      fechaServicio: req.body.fechaServicio,
      horaReservacion: req.body.horaReservacion,
      parque: req.body.parque,
      estadoUbicacion: req.body.estadoUbicacion,
      tipoEvento: req.body.tipoEvento,
    };

    // Validar duplicidad al editar reserva para mismo fecha, hora y parque
    const existe = await Reservation.findOne({
      _id: { $ne: id },
      fechaServicio: datosEditables.fechaServicio,
      horaReservacion: datosEditables.horaReservacion,
      parque: datosEditables.parque,
    });
    if (existe) {
      return res
        .status(409)
        .json({ error: "El horario ya está ocupado en ese parque." });
    }

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
    console.error("Error actualizando datos:", err);
    return res.status(500).json({ error: "Error al actualizar datos" });
  }
});

//PUT /api/reservations/:id/estado
// Cambiar el estado administrativo: pndiente, aprobado, cancelado, solo un administrador puede hacerlo desde el panel
router.put("/:id/estado", async (req, res) => {
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
    console.error("Error actualizando estado:", err);
    return res.status(500).json({ error: "Error al actualizar estado" });
  }
});

//DELETE /api/reservations/:id
// Eliminar reserva solo los administradores pueden hacerlo

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const eliminada = await Reservation.findByIdAndDelete(id);

    if (!eliminada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json({ mensaje: "Reserva eliminada correctamente", eliminada });
  } catch (err) {
    console.error("Error al eliminar reserva:", err);
    return res.status(500).json({ error: "Error al eliminar reserva" });
  }
});

module.exports = router;
