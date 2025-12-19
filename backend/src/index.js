/*
  BRINCAPARK - Servidor Backend Principal
  Este es el punto de entrada de nuestra API. Aquí configuramos Express,
  conectamos a MongoDB y montamos todas las rutas de la aplicación.
*/
require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

const connectDB = require("./config/db");

const reservationsRoute = require("./routes/reservations"); // Rutas públicas de reservas
const adminRoute = require("./routes/admin"); // Rutas administrativas requieren autenticacion
const configRoute = require("./routes/config"); // Rutas de configuración del sistema

app.use(express.json());
app.use(cors());

// Rutas

app.use("/api/reservations", reservationsRoute); // Ej: POST /api/reservations, GET /api/reservations
app.use("/api/admin", adminRoute); // Ej: GET /api/admin/reservations
app.use("/api/config", configRoute); // Ej: GET /api/config, PUT /api/config

// Ruta simple para verificar que el servidor está funcionando
app.get("/", (req, res) => res.send("Backend BRINCAPARK - funcionando"));

// Iniciar Servidor

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();

    // Una vez conectados a la BD, iniciamos el servidor HTTP
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    // Si algo sale mal generalmente la conexión a MongoDB, mostramos el error
    console.error("Error iniciando servidor:", err);
    process.exit(1);
  }
})();

module.exports = app;