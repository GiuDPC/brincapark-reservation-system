// src/config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    // Conectamos usando la URL de .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1); // salimos si no podemos conectar
  }
}

module.exports = connectDB;
