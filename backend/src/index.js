require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler.middleware");

//rutas
const reservationRoutes = require("./routes/reservation.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const configRoutes = require("./routes/config.routes");
const adminRoutes = require("./routes/admin.js");

app.use(express.json());
app.use(cors());

//montar rutas
app.use("/api/reservations", reservationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/config", configRoutes);
app.use("/api/admin", adminRoutes);

// ruta raiz para verificar que el servidor está activo
app.get("/", (req, res) => {
  res.json({ message: "API de Brincapark funcionando", status: "ok" });
});

//manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    })
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

module.exports = app;