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

//GET /api/reservations/:id
// Obtener una reserva específica por id solo administrador

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

// GET /api/reservations/analytics/stats
// Obtener estadísticas avanzadas para el dashboard
router.get("/analytics/stats", async (req, res) => {
  try {
    const reservas = await Reservation.find();
    const Config = require("../models/Config");
    const config = await Config.getConfig();

    // Calcular métricas
    const total = reservas.length;
    const pendientes = reservas.filter(
      (r) => r.estadoReserva === "pendiente"
    ).length;
    const aprobados = reservas.filter(
      (r) => r.estadoReserva === "aprobado"
    ).length;
    const cancelados = reservas.filter(
      (r) => r.estadoReserva === "cancelado"
    ).length;

    // Tasa de conversión
    const tasaConversion =
      total > 0 ? ((aprobados / total) * 100).toFixed(2) : 0;

    // Calcular ingresos esto solo de reservas aprobadas
    let ingresoTotal = 0;
    const reservasAprobadas = reservas.filter(
      (r) => r.estadoReserva === "aprobado"
    );

    reservasAprobadas.forEach((r) => {
      const paquete = r.paquete;
      // Parsear fecha manualmente para evitar problemas de zona horaria
      // El formota de la fecha es este YYYY-MM-DD
      const [year, month, day] = r.fechaServicio.split("-").map(Number);
      const fecha = new Date(year, month - 1, day); // month - 1 porque en JS los meses son 0 indexed
      const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, 5=viernes, 6=sábado
      // viernes (5) sabado (6) domingo (0) = fin de semana
      // lunes (1) a jueves (4) = dia de semana
      const esFinDeSemana =
        diaSemana === 0 || diaSemana === 5 || diaSemana === 6;

      let precio = 0;
      if (paquete === "mini") {
        precio = esFinDeSemana
          ? config.paquetes.mini.viernes
          : config.paquetes.mini.lunes;
      } else if (paquete === "mediano") {
        precio = esFinDeSemana
          ? config.paquetes.mediano.viernes
          : config.paquetes.mediano.lunes;
      } else if (paquete === "full") {
        precio = esFinDeSemana
          ? config.paquetes.full.viernes
          : config.paquetes.full.lunes;
      }
      ingresoTotal += precio;
    });

    // Ingreso promedio
    let ingresoPromedio =
      reservasAprobadas.length > 0
        ? ingresoTotal / reservasAprobadas.length
        : 0;

    // Convertir a bolivares solomanete si es necesario
    if (config.moneda === "BS") {
      ingresoTotal = ingresoTotal * config.tasaBCV;
      ingresoPromedio = ingresoPromedio * config.tasaBCV;
    }

    // Formatear con 2 decimales
    ingresoTotal = parseFloat(ingresoTotal.toFixed(2));
    ingresoPromedio = parseFloat(ingresoPromedio.toFixed(2));

    // Día más popular
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const contadorDias = {};
    reservas.forEach((r) => {
      // Parsear la fecha correctamente en el formato de YYYY-MM-DD
      const [year, month, day] = r.fechaServicio.split("-").map(Number);
      const fecha = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0 indexed
      const dia = diasSemana[fecha.getDay()];
      contadorDias[dia] = (contadorDias[dia] || 0) + 1;
    });

    // Encontrar el día con mas reservas
    let diaMasPopular = "N/A";
    if (Object.keys(contadorDias).length > 0) {
      diaMasPopular = Object.keys(contadorDias).reduce((a, b) =>
        contadorDias[a] > contadorDias[b] ? a : b
      );
    }

    // Paquete mas vendido
    const contadorPaquetes = {};
    reservas.forEach((r) => {
      contadorPaquetes[r.paquete] = (contadorPaquetes[r.paquete] || 0) + 1;
    });
    const paqueteMasVendido = Object.keys(contadorPaquetes).reduce(
      (a, b) => (contadorPaquetes[a] > contadorPaquetes[b] ? a : b),
      "N/A"
    );

    // Distribucion por parque
    const porParque = {};
    reservas.forEach((r) => {
      porParque[r.parque] = (porParque[r.parque] || 0) + 1;
    });

    // Distribucion por tipo de evento
    const porTipoEvento = {};
    reservas.forEach((r) => {
      porTipoEvento[r.tipoEvento] = (porTipoEvento[r.tipoEvento] || 0) + 1;
    });

    return res.json({
      total,
      pendientes,
      aprobados,
      cancelados,
      tasaConversion: parseFloat(tasaConversion),
      ingresoTotal,
      ingresoPromedio,
      diaMasPopular,
      paqueteMasVendido,
      porParque,
      porTipoEvento,
      moneda: config.moneda,
    });
  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
    return res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// GET /api/reservations/analytics/monthly
// Obtener datos mensuales para graficas de los ultimos 6 meses
router.get("/analytics/monthly", async (req, res) => {
  try {
    const reservas = await Reservation.find();
    const Config = require("../models/Config");
    const config = await Config.getConfig();

    const ahora = new Date();
    const meses = [];
    const ingresosPorMes = [];
    const reservasPorMes = [];

    // Generar ultimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesNombre = fecha.toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      });
      meses.push(mesNombre);

      // Filtrar reservas de ese mes
      const reservasMes = reservas.filter((r) => {
        const fechaReserva = new Date(r.fechaServicio);
        return (
          fechaReserva.getMonth() === fecha.getMonth() &&
          fechaReserva.getFullYear() === fecha.getFullYear() &&
          r.estadoReserva === "aprobado"
        );
      });

      reservasPorMes.push(reservasMes.length);

      // Calcular ingresos del mes
      let ingresoMes = 0;
      reservasMes.forEach((r) => {
        const paquete = r.paquete;
        // Parsear fecha manualmente para evitar problemas de zona horaria
        const [year, month, day] = r.fechaServicio.split("-").map(Number);
        const fechaR = new Date(year, month - 1, day);
        const diaSemana = fechaR.getDay();
        // Viernes (5)  Sábado (6) Domingo (0) = fin de semana
        const esFinDeSemana =
          diaSemana === 0 || diaSemana === 5 || diaSemana === 6;

        let precio = 0;
        if (paquete === "mini") {
          precio = esFinDeSemana
            ? config.paquetes.mini.viernes
            : config.paquetes.mini.lunes;
        } else if (paquete === "mediano") {
          precio = esFinDeSemana
            ? config.paquetes.mediano.viernes
            : config.paquetes.mediano.lunes;
        } else if (paquete === "full") {
          precio = esFinDeSemana
            ? config.paquetes.full.viernes
            : config.paquetes.full.lunes;
        }
        ingresoMes += precio;
      });

      ingresosPorMes.push(ingresoMes);
    }

    // Convertir a bolivares solamente si es necesario
    const ingresosConvertidos =
      config.moneda === "BS"
        ? ingresosPorMes.map((ingreso) =>
            parseFloat((ingreso * config.tasaBCV).toFixed(2))
          )
        : ingresosPorMes.map((ingreso) => parseFloat(ingreso.toFixed(2)));

    return res.json({
      meses,
      ingresos: ingresosConvertidos,
      reservas: reservasPorMes,
      moneda: config.moneda,
    });
  } catch (err) {
    console.error("Error obteniendo datos mensuales:", err);
    return res.status(500).json({ error: "Error al obtener datos mensuales" });
  }
});

// GET /api/reservations/analytics/top-clients
// Obtener top clientes frecuentes
router.get("/analytics/top-clients", async (req, res) => {
  try {
    const reservas = await Reservation.find();

    // Agrupar por correo es un identificador unico del cliente
    const clientesMap = {};
    reservas.forEach((r) => {
      if (!clientesMap[r.correo]) {
        clientesMap[r.correo] = {
          nombre: r.nombreCompleto,
          correo: r.correo,
          telefono: r.telefono,
          totalReservas: 0,
          aprobadas: 0,
          canceladas: 0,
        };
      }
      clientesMap[r.correo].totalReservas++;
      if (r.estadoReserva === "aprobado") clientesMap[r.correo].aprobadas++;
      if (r.estadoReserva === "cancelado") clientesMap[r.correo].canceladas++;
    });

    // Convertir a array y ordenar por total de reservas
    const topClientes = Object.values(clientesMap)
      .sort((a, b) => b.totalReservas - a.totalReservas)
      .slice(0, 10); // Hasta el top 10

    return res.json(topClientes);
  } catch (err) {
    console.error("Error obteniendo top clientes:", err);
    return res.status(500).json({ error: "Error al obtener top clientes" });
  }
});

// GET /api/reservations/analytics/cancellations
// Análisis de cancelaciones
router.get("/analytics/cancellations", async (req, res) => {
  try {
    const reservas = await Reservation.find({ estadoReserva: "cancelado" });

    // Análisis por parque
    const porParque = {};
    reservas.forEach((r) => {
      porParque[r.parque] = (porParque[r.parque] || 0) + 1;
    });

    // Analisis por paquete
    const porPaquete = {};
    reservas.forEach((r) => {
      porPaquete[r.paquete] = (porPaquete[r.paquete] || 0) + 1;
    });

    // Analisis por tipo de evento
    const porTipoEvento = {};
    reservas.forEach((r) => {
      porTipoEvento[r.tipoEvento] = (porTipoEvento[r.tipoEvento] || 0) + 1;
    });

    // Analisis por mes
    const porMes = {};
    reservas.forEach((r) => {
      const fecha = new Date(r.fechaServicio);
      const mes = fecha.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
      porMes[mes] = (porMes[mes] || 0) + 1;
    });

    return res.json({
      total: reservas.length,
      porParque,
      porPaquete,
      porTipoEvento,
      porMes,
      reservas: reservas.map((r) => ({
        id: r._id,
        cliente: r.nombreCompleto,
        fecha: r.fechaServicio,
        parque: r.parque,
        paquete: r.paquete,
        tipoEvento: r.tipoEvento,
      })),
    });
  } catch (err) {
    console.error("Error analizando cancelaciones:", err);
    return res.status(500).json({ error: "Error al analizar cancelaciones" });
  }
});

module.exports = router;
