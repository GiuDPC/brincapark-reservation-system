import mongoose, { Document, Schema } from "mongoose";

export interface IReservation extends Document {
  nombreCompleto: string;
  correo: string;
  telefono: string;
  paquete: string;
  fechaServicio: string;
  horaReservacion: "10am-1pm" | "2pm-5pm" | "6pm-9pm";
  parque: "Maracaibo" | "Caracas" | "Punto Fijo";
  estadoUbicacion: string;
  tipoEvento: string;
  estadoReserva: "pendiente" | "aprobado" | "cancelado";
  createdAt: Date;
}


const ReservationSchema = new Schema({
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

  fechaServicio: {
    type: String,
    required: true,
  },

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

  estadoUbicacion: {
    type: String,
    required: true,
  },

  tipoEvento: {
    type: String,
    required: true,
  },

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

export default mongoose.model<IReservation>("Reservation", ReservationSchema);
