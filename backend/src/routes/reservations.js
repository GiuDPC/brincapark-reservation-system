const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");

//POST /api/reservations
//Crear una nueva reserva pública formulario de cliente publico desde pagina principal

router.post("/", async (req, res) => {
  try {
    const {
      nombreCompleto,
      correo,
      telefono,
      paquete,
      fechaServicio,
      horaReservacion,
      parque,
      estadoUbicacion,
      tipoEvento,
    } = req.body;

    // Validación de campos obligatorios para crear reserva
    if (
      !nombreCompleto ||
      !correo ||
      !telefono ||
      !paquete ||
      !fechaServicio ||
      !horaReservacion ||
      !parque ||
      !estadoUbicacion ||
      !tipoEvento
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar duplicidad de reserva para mismo fecha, hora y parque
    const existe = await Reservation.findOne({
      fechaServicio,
      horaReservacion,
      parque,
    });
    if (existe) {
      return res
        .status(409)
        .json({ error: "El horario ya está ocupado en ese parque." });
    }

    // Validar lógica de paquetes y cantidades de personas por paquete
    let maxNinos = 0,
      maxAdultos = 0,
      maxTotal = 0;
    if (paquete === "mini") {
      maxNinos = 12;
      maxAdultos = 18;
      maxTotal = 30;
    } else if (paquete === "mediana") {
      maxNinos = 30;
      maxAdultos = 35;
      maxTotal = 65;
    } else if (paquete === "full") {
      maxNinos = 40;
      maxAdultos = 45;
      maxTotal = 85;
    }
    // Si se envían los campos de cantidad, validar aquí ojo solo es opcional

    // Crear la reserva a bases de datos mongoDB
    const nuevaReserva = await Reservation.create({
      nombreCompleto,
      correo,
      telefono,
      paquete,
      fechaServicio,
      horaReservacion,
      parque,
      estadoUbicacion,
      tipoEvento,
    });

    return res.status(201).json(nuevaReserva);
  } catch (err) {
    console.error("Error creando reserva:", err);
    return res.status(500).json({ error: "Error interno al crear reserva" });
  }
});

//GET /api/reservations
//Poder ver todas las reservas -> listar todas las reservas solo en el panel administrador

router.get("/", async (req, res) => {
  try {
    const reservas = await Reservation.find().sort({ createdAt: -1 });
    return res.json(reservas);
  } catch (err) {
    console.error("Error al listar reservas:", err);
    return res.status(500).json({ error: "Error al obtener reservas" });
  }
});

// GET /api/reservations/horarios-ocupados
// Endpoint para obtener horarios ocupados por fecha y parque
router.get("/horarios-ocupados", async (req, res) => {
  const { fechaServicio, parque } = req.query;
  if (!fechaServicio || !parque) {
    return res.status(400).json({ error: "Fecha y parque son requeridos." });
  }
  try {
    const reservas = await Reservation.find({ fechaServicio, parque });
    const horariosOcupados = reservas.map((r) => r.horaReservacion);
    res.json({ horariosOcupados });
  } catch (err) {
    res.status(500).json({ error: "Error al consultar horarios ocupados." });
  }
});

// ==========================================
// RUTAS DE ANALYTICS (DEBEN ESTAR ANTES DE /:id)
// ==========================================

// GET /api/reservations/analytics/stats
router.get("/analytics/stats", async (req, res) => {
  try {
    const reservas = await Reservation.find();
    const Config = require("../models/Config");
    const config = await Config.getConfig();

    const total = reservas.length;
    const pendientes = reservas.filter(r => r.estadoReserva === "pendiente").length;
    const aprobados = reservas.filter(r => r.estadoReserva === "aprobado").length;
    const cancelados = reservas.filter(r => r.estadoReserva === "cancelado").length;
    const tasaConversion = total > 0 ? ((aprobados / total) * 100).toFixed(2) : 0;

    let ingresoTotal = 0;
    const reservasAprobadas = reservas.filter(r => r.estadoReserva === "aprobado");

    reservasAprobadas.forEach((r) => {
      const paquete = r.paquete;
      const [year, month, day] = r.fechaServicio.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);
      const diaSemana = fecha.getDay();
      const esFinDeSemana = diaSemana === 0 || diaSemana === 5 || diaSemana === 6;

      let precio = 0;
      if (paquete === "mini") {
        precio = esFinDeSemana ? config.paquetes.mini.viernes : config.paquetes.mini.lunes;
      } else if (paquete === "mediano") {
        precio = esFinDeSemana ? config.paquetes.mediano.viernes : config.paquetes.mediano.lunes;
      } else if (paquete === "full") {
        precio = esFinDeSemana ? config.paquetes.full.viernes : config.paquetes.full.lunes;
      }
      ingresoTotal += precio;
    });

    let ingresoPromedio = reservasAprobadas.length > 0 ? ingresoTotal / reservasAprobadas.length : 0;

    if (config.moneda === "BS") {
      ingresoTotal = ingresoTotal * config.tasaBCV;
      ingresoPromedio = ingresoPromedio * config.tasaBCV;
    }

    ingresoTotal = parseFloat(ingresoTotal.toFixed(2));
    ingresoPromedio = parseFloat(ingresoPromedio.toFixed(2));

    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const contadorDias = {};
    reservas.forEach((r) => {
      const [year, month, day] = r.fechaServicio.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);
      const dia = diasSemana[fecha.getDay()];
      contadorDias[dia] = (contadorDias[dia] || 0) + 1;
    });

    let diaMasPopular = "N/A";
    if (Object.keys(contadorDias).length > 0) {
      diaMasPopular = Object.keys(contadorDias).reduce((a, b) =>
        contadorDias[a] > contadorDias[b] ? a : b
      );
    }

    const contadorPaquetes = {};
    reservas.forEach((r) => {
      contadorPaquetes[r.paquete] = (contadorPaquetes[r.paquete] || 0) + 1;
    });
    const paqueteMasVendido = Object.keys(contadorPaquetes).reduce(
      (a, b) => (contadorPaquetes[a] > contadorPaquetes[b] ? a : b),
      "N/A"
    );

    const porParque = {};
    reservas.forEach((r) => {
      porParque[r.parque] = (porParque[r.parque] || 0) + 1;
    });

    const porTipoEvento = {};
    reservas.forEach((r) => {
      porTipoEvento[r.tipoEvento] = (porTipoEvento[r.tipoEvento] || 0) + 1;
    });

    return res.json({
      total, pendientes, aprobados, cancelados,
      tasaConversion: parseFloat(tasaConversion),
      ingresoTotal, ingresoPromedio, diaMasPopular, paqueteMasVendido,
      porParque, porTipoEvento, moneda: config.moneda,
    });
  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// GET /api/reservations/analytics/monthly
router.get("/analytics/monthly", async (req, res) => {
  try {
    const reservas = await Reservation.find();
    const Config = require("../models/Config");
    const config = await Config.getConfig();

    const ahora = new Date();
    const meses = [];
    const ingresosPorMes = [];
    const reservasPorMes = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesNombre = fecha.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
      meses.push(mesNombre);

      const reservasMes = reservas.filter((r) => {
        const fechaReserva = new Date(r.fechaServicio);
        return fechaReserva.getMonth() === fecha.getMonth() &&
          fechaReserva.getFullYear() === fecha.getFullYear() &&
          r.estadoReserva === "aprobado";
      });

      reservasPorMes.push(reservasMes.length);

      let ingresoMes = 0;
      reservasMes.forEach((r) => {
        const paquete = r.paquete;
        const [year, month, day] = r.fechaServicio.split("-").map(Number);
        const fechaR = new Date(year, month - 1, day);
        const diaSemana = fechaR.getDay();
        const esFinDeSemana = diaSemana === 0 || diaSemana === 5 || diaSemana === 6;

        let precio = 0;
        if (paquete === "mini") {
          precio = esFinDeSemana ? config.paquetes.mini.viernes : config.paquetes.mini.lunes;
        } else if (paquete === "mediano") {
          precio = esFinDeSemana ? config.paquetes.mediano.viernes : config.paquetes.mediano.lunes;
        } else if (paquete === "full") {
          precio = esFinDeSemana ? config.paquetes.full.viernes : config.paquetes.full.lunes;
        }
        ingresoMes += precio;
      });

      ingresosPorMes.push(ingresoMes);
    }

    const ingresosConvertidos = config.moneda === "BS"
      ? ingresosPorMes.map((ingreso) => parseFloat((ingreso * config.tasaBCV).toFixed(2)))
      : ingresosPorMes.map((ingreso) => parseFloat(ingreso.toFixed(2)));

    return res.json({ meses, ingresos: ingresosConvertidos, reservas: reservasPorMes, moneda: config.moneda });
  } catch (err) {
    console.error("Error obteniendo datos mensuales:", err);
    return res.status(500).json({ error: "Error al obtener datos mensuales" });
  }
});

// GET /api/reservations/analytics/top-clients
router.get("/analytics/top-clients", async (req, res) => {
  try {
    const reservas = await Reservation.find();
    const clientesMap = {};
    reservas.forEach((r) => {
      if (!clientesMap[r.correo]) {
        clientesMap[r.correo] = { nombre: r.nombreCompleto, correo: r.correo, telefono: r.telefono, totalReservas: 0, aprobadas: 0, canceladas: 0 };
      }
      clientesMap[r.correo].totalReservas++;
      if (r.estadoReserva === "aprobado") clientesMap[r.correo].aprobadas++;
      if (r.estadoReserva === "cancelado") clientesMap[r.correo].canceladas++;
    });
    const topClientes = Object.values(clientesMap).sort((a, b) => b.totalReservas - a.totalReservas).slice(0, 10);
    return res.json(topClientes);
  } catch (err) {
    console.error("Error obteniendo top clientes:", err);
    return res.status(500).json({ error: "Error al obtener top clientes" });
  }
});

// GET /api/reservations/analytics/cancellations
router.get("/analytics/cancellations", async (req, res) => {
  try {
    const reservas = await Reservation.find({ estadoReserva: "cancelado" });
    const porParque = {};
    reservas.forEach((r) => { porParque[r.parque] = (porParque[r.parque] || 0) + 1; });
    const porPaquete = {};
    reservas.forEach((r) => { porPaquete[r.paquete] = (porPaquete[r.paquete] || 0) + 1; });
    const porTipoEvento = {};
    reservas.forEach((r) => { porTipoEvento[r.tipoEvento] = (porTipoEvento[r.tipoEvento] || 0) + 1; });
    const porMes = {};
    reservas.forEach((r) => {
      const fecha = new Date(r.fechaServicio);
      const mes = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      porMes[mes] = (porMes[mes] || 0) + 1;
    });
    return res.json({ total: reservas.length, porParque, porPaquete, porTipoEvento, porMes });
  } catch (err) {
    console.error("Error analizando cancelaciones:", err);
    return res.status(500).json({ error: "Error al analizar cancelaciones" });
  }
});

// ==========================================
// RUTAS CON PARÁMETROS (DEBEN ESTAR AL FINAL)
// ==========================================

//GET /api/reservations/:id
// Obtener una reserva específica por id
router.get("/:id", async (req, res) => {
  try {
    const reserva = await Reservation.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    return res.json(reserva);
  } catch (err) {
    console.error("Error buscando reserva por ID:", err);
    return res.status(500).json({ error: "Error al obtener reserva" });
  }
});

//PUT /api/reservations/:id
//Editar datos del formulario estadoUbicacion, ciudad, paquete, etc
//No toca el estado administrativo

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const datosEditables = {
      nombreCompleto: req.body.nombreCompleto,
      correo: req.body.correo,
      telefono: req.body.telefono,
      paquete: req.body.paquete,
      fechaServicio: req.body.fechaServicio,
      horaReservacion: req.body.horaReservacion,
      parque: req.body.parque,
      estadoUbicacion: req.body.estadoUbicacion,
      tipoEvento: req.body.tipoEvento,
    };

    // Validar duplicidad al editar reserva para mismo fecha, hora y parque
    const existe = await Reservation.findOne({
      _id: { $ne: id },
      fechaServicio: datosEditables.fechaServicio,
      horaReservacion: datosEditables.horaReservacion,
      parque: datosEditables.parque,
    });
    if (existe) {
      return res
        .status(409)
        .json({ error: "El horario ya está ocupado en ese parque." });
    }

    const actualizada = await Reservation.findByIdAndUpdate(
      id,
      datosEditables,
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json(actualizada);
  } catch (err) {
    console.error("Error actualizando datos:", err);
    return res.status(500).json({ error: "Error al actualizar datos" });
  }
});

//PUT /api/reservations/:id/estado
// Cambiar el estado administrativo: pndiente, aprobado, cancelado, solo un administrador puede hacerlo desde el panel
router.put("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoReserva } = req.body;

    const estadosValidos = ["pendiente", "aprobado", "cancelado"];
    if (!estadosValidos.includes(estadoReserva)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const actualizada = await Reservation.findByIdAndUpdate(
      id,
      { estadoReserva },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json(actualizada);
  } catch (err) {
    console.error("Error actualizando estado:", err);
    return res.status(500).json({ error: "Error al actualizar estado" });
  }
});

//DELETE /api/reservations/:id
// Eliminar reserva solo los administradores pueden hacerlo

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const eliminada = await Reservation.findByIdAndDelete(id);

    if (!eliminada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    return res.json({ mensaje: "Reserva eliminada correctamente", eliminada });
  } catch (err) {
    console.error("Error al eliminar reserva:", err);
    return res.status(500).json({ error: "Error al eliminar reserva" });
  }
});

module.exports = router;

