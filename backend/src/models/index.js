/* src/models/index.js
   Exporta la conexión y los modelos
*/
const sequelize = require('../config/db');
const Reservation = require('./Reservation');

module.exports = { sequelize, Reservation };
