import "dotenv/config";
import express, { Request, Response } from "express";
const app = express();
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler.middleware";

//rutas
import reservationRoutes from "./routes/reservation.routes";
import analyticsRoutes from "./routes/analytics.routes";
import configRoutes from "./routes/config.routes";
import adminRoutes from "./routes/admin";

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// healthcheck
app.get("/health", async (req: Request, res: Response) => {
  const mongoose = await import("mongoose");
  const dbState = mongoose.default.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    uptime: process.uptime(),
    db: dbStatus[dbState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/reservations", reservationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/config", configRoutes);
app.use("/api/admin", adminRoutes);

// ruta raiz
app.get("/", (req: Request, res: Response) => {
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

export default app;