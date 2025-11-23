const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  paquete: { type: String, required: true }, // mini, mediana, full
  fechaServicio: { type: String, required: true }, // YYYY-MM-DD
  horaReservacion: {
    type: String,
    required: true,
    enum: ["10am-1pm", "2pm-5pm", "6pm-9pm"],
  },
  parque: {
    type: String,
    required: true,
    enum: ["Maracaibo", "Caracas", "Punto Fijo"],
  },
  estadoUbicacion: { type: String, required: true }, // FALCON, ZULIA... ETC
  tipoEvento: { type: String, required: true }, // fiesta, escolar... ENTRE OTROS

  estadoReserva: {
    type: String,
    enum: ["pendiente", "aprobado", "cancelado"],
    default: "pendiente",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reservation", ReservationSchema);
