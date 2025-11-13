// src/models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  nombre: { type: String, required: true },            // nombre del solicitante
  contacto: { type: String, required: true },          // email o teléfono
  fechaVisita: { type: String, required: true },       // YYYY-MM-DD (string para simplicidad)
  numeroPersonas: { type: Number, required: true },    // número de personas
  actividad: { type: String, default: '' },            // actividad opcional
  estado: { type: String, enum: ['pendiente','aprobado','cancelado'], default: 'pendiente' },
  notas: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', ReservationSchema);
