// Configuración del sistema - precios, moneda y tasa BCV
// Se guarda en BD para poder actualizar desde el panel admin sin redeployar

const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    // USD o BS (Bolívares)
    moneda: {
      type: String,
      enum: ["USD", "BS"],
      default: "USD",
      required: true,
    },

    // Tasa BCV (1 USD = X Bs)
    tasaBCV: {
      type: Number,
      default: 244.65,
      min: 0,
      required: true,
    },

    // Precios de tickets
    tickets: {
      min15: { type: Number, default: 6, min: 0 }, // 15 minutos
      min30: { type: Number, default: 9, min: 0 }, // 30 minutos
      min60: { type: Number, default: 10, min: 0 }, // 1 hora
      fullday: { type: Number, default: 11, min: 0 }, // Full day
      combo: { type: Number, default: 13, min: 0 }, // Combo Super Magico
    },

    // Paquetes de fiestas (lunes-jueves vs viernes-domingo)
    paquetes: {
      // Mini: hasta 30 personas
      mini: {
        lunes: { type: Number, default: 150, min: 0 },
        viernes: { type: Number, default: 180, min: 0 },
      },
      // Mediano: hasta 60 personas
      mediano: {
        lunes: { type: Number, default: 200, min: 0 },
        viernes: { type: Number, default: 230, min: 0 },
      },
      // Full: hasta 80 personas
      full: {
        lunes: { type: Number, default: 250, min: 0 },
        viernes: { type: Number, default: 280, min: 0 },
      },
    },

    // Singleton solo puede haber un doc de config
    isSingleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Obtiene o crea la config
configSchema.statics.getConfig = async function () {
  let config = await this.findOne({ isSingleton: true });
  if (!config) config = await this.create({ isSingleton: true });
  return config;
};

// Actualiza la config
configSchema.statics.updateConfig = async function (updates) {
  let config = await this.getConfig();
  Object.assign(config, updates);
  await config.save();
  return config;
};

module.exports = mongoose.model("Config", configSchema);
