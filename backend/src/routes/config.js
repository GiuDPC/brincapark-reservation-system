const express = require("express");
const router = express.Router();
const Config = require("../models/Config");

// GET /api/config
// Obtener la configuración actual del sistema
router.get("/", async (req, res) => {
  try {
    const config = await Config.getConfig();
    return res.json(config);
  } catch (err) {
    console.error("Error obteniendo configuración:", err);
    return res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// PUT /api/config
// Actualizar la configuración del sistema
router.put("/", async (req, res) => {
  try {
    const { moneda, tasaBCV, tickets, paquetes } = req.body;

    // Validaciones
    if (moneda && !["USD", "BS"].includes(moneda)) {
      return res.status(400).json({ error: "Moneda inválida. Use USD o BS" });
    }

    if (tasaBCV !== undefined && (tasaBCV < 0 || isNaN(tasaBCV))) {
      return res.status(400).json({ error: "Tasa BCV inválida" });
    }

    // Validar precios de tickets
    if (tickets) {
      const ticketKeys = ["min15", "min30", "min60", "fullday", "combo"];
      for (const key of ticketKeys) {
        if (
          tickets[key] !== undefined &&
          (tickets[key] < 0 || isNaN(tickets[key]))
        ) {
          return res
            .status(400)
            .json({ error: `Precio de ticket ${key} inválido` });
        }
      }
    }

    // Validar precios de paquetes
    if (paquetes) {
      const paqueteKeys = ["mini", "mediano", "full"];
      for (const paquete of paqueteKeys) {
        if (paquetes[paquete]) {
          if (
            paquetes[paquete].lunes !== undefined &&
            (paquetes[paquete].lunes < 0 || isNaN(paquetes[paquete].lunes))
          ) {
            return res
              .status(400)
              .json({ error: `Precio de paquete ${paquete} lunes inválido` });
          }
          if (
            paquetes[paquete].viernes !== undefined &&
            (paquetes[paquete].viernes < 0 || isNaN(paquetes[paquete].viernes))
          ) {
            return res
              .status(400)
              .json({ error: `Precio de paquete ${paquete} viernes inválido` });
          }
        }
      }
    }

    // Actualizar configuración
    const updates = {};
    if (moneda) updates.moneda = moneda;
    if (tasaBCV !== undefined) updates.tasaBCV = tasaBCV;
    if (tickets) updates.tickets = tickets;
    if (paquetes) updates.paquetes = paquetes;

    const config = await Config.updateConfig(updates);
    return res.json(config);
  } catch (err) {
    console.error("Error actualizando configuración:", err);
    return res.status(500).json({ error: "Error al actualizar configuración" });
  }
});

// GET /api/config/precios
// Obtener precios convertidos según la moneda actual, aqui calcula los precios segun la moneda, y los convierte todos
router.get("/precios", async (req, res) => {
  try {
    const config = await Config.getConfig();

    const precios = {
      moneda: config.moneda,
      tasaBCV: config.tasaBCV,
      tickets: {},
      paquetes: {},
    };

    // Convertir precios de tickets
    const ticketKeys = ["min15", "min30", "min60", "fullday", "combo"];
    for (const key of ticketKeys) {
      const precioUSD = config.tickets[key];
      precios.tickets[key] = {
        USD: precioUSD,
        BS: Math.round(precioUSD * config.tasaBCV * 100) / 100,
        actual:
          config.moneda === "USD"
            ? precioUSD
            : Math.round(precioUSD * config.tasaBCV * 100) / 100,
      };
    }

    // Convertir precios de paquetes
    const paqueteKeys = ["mini", "mediano", "full"];
    for (const paquete of paqueteKeys) {
      precios.paquetes[paquete] = {
        lunes: {
          USD: config.paquetes[paquete].lunes,
          BS:
            Math.round(config.paquetes[paquete].lunes * config.tasaBCV * 100) /
            100,
          actual:
            config.moneda === "USD"
              ? config.paquetes[paquete].lunes
              : Math.round(
                  config.paquetes[paquete].lunes * config.tasaBCV * 100
                ) / 100,
        },
        viernes: {
          USD: config.paquetes[paquete].viernes,
          BS:
            Math.round(
              config.paquetes[paquete].viernes * config.tasaBCV * 100
            ) / 100,
          actual:
            config.moneda === "USD"
              ? config.paquetes[paquete].viernes
              : Math.round(
                  config.paquetes[paquete].viernes * config.tasaBCV * 100
                ) / 100,
        },
      };
    }

    return res.json(precios);
  } catch (err) {
    console.error("Error obteniendo precios:", err);
    return res.status(500).json({ error: "Error al obtener precios" });
  }
});

module.exports = router;
