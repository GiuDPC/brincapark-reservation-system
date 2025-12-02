//ÍNDICE DE MODELOS

//Este archivo exporta todos los modelos de Mongoose para facilitar
//Y para nota este archivo originalmente estaba configurado para Sequelize (SQL),
//pero el proyecto se cambio a MongoDB con Mongoose, se mantiene por compatibilidad
//pero no es estrictamente necesario

const Reservation = require("./Reservation");
const Config = require("./Config");

// Exportamos los modelos para que puedan ser importados fácilmente
// Ejemplo de uso const { Reservation, Config } = require('./models');
module.exports = {
  Reservation,
  Config,
};
