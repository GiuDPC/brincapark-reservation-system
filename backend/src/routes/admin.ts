import express, {Request, Response} from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import Reservation from "../models/Reservation";
import adminAuth from "../middleware/adminAuth";

// LOGIN - No requiere autenticación
router.post("/login", async (req: Request, res: Response) => {
  const { secret } = req.body;

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Credenciales incorrectos" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  res.json({ token });
});

// Middleware de autenticación para las rutas siguientes
router.use(adminAuth);

// GET - Obtener todas las reservas
router.get("/reservas", async (req: Request, res: Response ) => {
  try {
    const all = await Reservation.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.error("Error obteniendo las reservas", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// PATCH - Actualizar estado de una reserva
router.patch("/reservas/:id", async (req: Request, res: Response ) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["pendiente", "aprobado", "cancelado"].includes(estado)) {
      return res.status(400).json({ error: "Estado invalido" });
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
    console.error("Error actualizando la reserva", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// DELETE - Eliminar una reserva
router.delete("/reservas/:id", async (req: Request, res: Response ) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva eliminada" });
  } catch (err) {
    console.error("Error eliminando reserva", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
