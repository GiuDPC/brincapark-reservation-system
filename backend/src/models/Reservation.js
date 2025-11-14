const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  paquete: { type: String, required: true },                  // mini, medio, full
  fechaServicio: { type: String, required: true },            // YYYY-MM-DD
  ciudad: { type: String, required: true },
  estadoUbicacion: { type: String, required: true },          // Falcon, Zulia etc...
  tipoEvento: { type: String, required: true },               // fiesta, escolar...

  estadoReserva: { 
    type: String,
    enum: ["pendiente", "aprobado", "cancelado"],
    default: "pendiente"
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', ReservationSchema);
