const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({

  // Informacion del cliente
  nombreCompleto: {
    type: String,
    required: true,
  },

  /*correo electronico del cliente ejemplo seria jose02@gmail.com*/
  correo: {
    type: String,
    required: true,
  },

  //Numero de teléfono del cliente
  // Ejemplo: "+58 414-1234567" el numero de telefono es en formato venezolano de 11 digitos

  telefono: {
    type: String,
    required: true,
  },

  // DETALLES DE LA RESERVA
  // aqui selecciona el paquete alguno de los 3 paquete que ofrece brincapark

  paquete: {
    type: String,
    required: true,
  },

  //Fecha del servicio
  // Formato: YYYY-MM-DD  por ejemplo 2025-12-25)
  // Se guarda como String para evitar problemas de zona horaria

  fechaServicio: {
    type: String,
    required: true,
  },

  //Horario de la reserva
  //aqui puede seleccionar el horario que desea algunos de los 3, mañana, tarde y noche

  horaReservacion: {
    type: String,
    required: true,
    enum: ["10am-1pm", "2pm-5pm", "6pm-9pm"], // Solo estos valores son validos
  },

  // Parque donde se realizará el evento
  // BRINCAPARK tiene 3 ubicaciones en Venezuela

  parque: {
    type: String,
    required: true,
    enum: ["Maracaibo", "Caracas", "Punto Fijo"], // Solo estos parques existen
  },

  //Estado/región donde vive el cliente
  estadoUbicacion: {
    type: String,
    required: true,
  },

  //Tipo de evento que se celebrara
  // Ejemplos "Cumpleaños", "Fiesta escolar"

  tipoEvento: {
    type: String,
    required: true,
  },

  // ESTADO ADMINISTRATIVO

  // esta lo gestiona el administrador, estado de pendiente es que esta recien creada esperando la confirmacion
  //aprobado cuando el personal administrativo la confirma osea el administrador
  // cancelad puede ser rechaza o cancelado por el mismo cliente
  //pero por defecto todas las reservas se crean en estado pendiente

  estadoReserva: {
    type: String,
    enum: ["pendiente", "aprobado", "cancelado"],
    default: "pendiente",
  },

  // METADATA

  //Fecha y hora en que se creo la reserva
  //Se genera automaticamente cuando se crea el documento
  //Útil para ordenar reservas y generar reportes

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reservation", ReservationSchema);
