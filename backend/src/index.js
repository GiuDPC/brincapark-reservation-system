// src/index.js
require('dotenv').config();           // 1. carga .env -> process.env
const express = require('express');   // 2. servidor
const app = express();
const cors = require('cors');         // 3. permitir cross-origin
const connectDB = require('./config/db'); // 4. conecta a MongoDB

// Rutas (módulos)
const reservationsRoute = require('./routes/reservations');
const adminRoute = require('./routes/admin');

// Middlewares globales
app.use(express.json()); // parsea JSON en req.body
app.use(cors());         // habilita CORS (dev)

// Montaje de rutas
app.use('/api/reservations', reservationsRoute);
app.use('/api/admin', adminRoute);

// Health check simple
app.get('/', (req, res) => res.send('Backend Parque - funcionando'));

// Arranque: conectar BD primero, luego levantar server
const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await connectDB(); // Conexión a MongoDB
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error iniciando servidor:', err);
    process.exit(1);
  }
})();
