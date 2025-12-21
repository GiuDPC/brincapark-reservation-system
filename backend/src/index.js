// Backend Brincapark - servidor Express + MongoDB
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/db");
const reservationsRoute = require("./routes/reservations");
const adminRoute = require("./routes/admin");
const configRoute = require("./routes/config");

app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/reservations", reservationsRoute);
app.use("/api/admin", adminRoute);
app.use("/api/config", configRoute);

app.get("/", (req, res) => res.send("Backend BRINCAPARK - funcionando"));

// Iniciar
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error iniciando servidor:", err);
    process.exit(1);
  }
})();

module.exports = app;
