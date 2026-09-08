import express, { Request, Response, NextFunction } from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import Reservation from "../models/Reservation";
import adminAuth, { AuthRequest } from "../middleware/adminAuth";

// LOGIN - No requiere autenticación
router.post("/login", async (req: Request, res: Response) => {
  const { secret } = req.body;

  if (!secret) {
    return res.status(400).json({ error: "Código de acceso requerido" });
  }

  const masterSecret = process.env.ADMIN_SECRET;
  const demoSecret = process.env.DEMO_SECRET || "1234";

  const isMaster = Boolean(masterSecret && secret === masterSecret);
  const isDemo = secret === demoSecret || secret === "demo";

  if (!isMaster && !isDemo) {
    return res.status(401).json({ error: "Código de acceso incorrecto" });
  }

  const role = isMaster ? "admin" : "demo-admin";
  const jwtSecret = process.env.JWT_SECRET || "brincapark_jwt_secure_key_2026";

  const token = jwt.sign(
    {
      role,
      isDemo: !isMaster,
      sub: isMaster ? "master-admin" : "demo-user",
    },
    jwtSecret,
    {
      expiresIn: "4h",
    }
  );

  res.json({
    token,
    role,
    isDemo: !isMaster,
    message: isMaster
      ? "Acceso administrativo concedido"
      : "Acceso demo concedido (modo de prueba protegido)",
  });
});

// Middleware de autenticación para las rutas siguientes
router.use(adminAuth);

// GET - Obtener todas las reservas
router.get("/reservas", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = await Reservation.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// PATCH - Actualizar estado de una reserva
router.patch("/reservas/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["pendiente", "aprobado", "cancelado"].includes(estado)) {
      return res.status(400).json({ error: "Estado invalido" });
    }

    // Si es demo, simular éxito para no alterar la base de datos de producción
    if (req.user && typeof req.user === "object" && (req.user as any).isDemo) {
      return res.json({
        _id: id,
        estadoReserva: estado,
        isDemo: true,
        message: "Estado actualizado exitosamente (Modo Demo)",
      });
    }

    const reserva = await Reservation.findByIdAndUpdate(
      id,
      { estadoReserva: estado },
      { new: true }
    );

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json(reserva);
  } catch (err) {
    next(err);
  }
});

// DELETE - Eliminar una reserva
router.delete("/reservas/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Si es demo, simular éxito para no eliminar reservas reales de MongoDB Atlas
    if (req.user && typeof req.user === "object" && (req.user as any).isDemo) {
      return res.json({
        message: "Reserva eliminada exitosamente (Modo Demo)",
        isDemo: true,
      });
    }

    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva eliminada" });
  } catch (err) {
    next(err);
  }
});

export default router;

