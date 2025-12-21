const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: true,
  },

  correo: {
    type: String,
    required: true,
  },

  telefono: {
    type: String,
    required: true,
  },

  paquete: {
    type: String,
    required: true,
  },

  // Formato: YYYY-MM-DD
  fechaServicio: {
    type: String,
    required: true,
  },

  horaReservacion: {
    type: String,
    required: true,
    enum: ["10am-1pm", "2pm-5pm", "6pm-9pm"], // Solo estos valores son validos
  },

  parque: {
    type: String,
    required: true,
    enum: ["Maracaibo", "Caracas", "Punto Fijo"], // Solo estos parques existen
  },

  estadoUbicacion: {
    type: String,
    required: true,
  },

  tipoEvento: {
    type: String,
    required: true,
  },

  // pendiente | aprobado | cancelado
  estadoReserva: {
    type: String,
    enum: ["pendiente", "aprobado", "cancelado"],
    default: "pendiente",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reservation", ReservationSchema);
