import mongoose, { Document, Schema } from "mongoose";


export interface IConfig extends Document {
  moneda: "USD" | "BS";
  tasaBCV: number;
  tickets: {
    min15: number;
    min30: number;
    min60: number;
    fullday: number;
    combo: number;
  };
  paquetes: {
    mini: {
      lunes: number;
      viernes: number;
    };
    mediano: {
      lunes: number;
      viernes: number;
    };
    full: {
      lunes: number;
      viernes: number;
    };
  };
  isSingleton: boolean;
}

const configSchema = new Schema(
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

    tickets: {
      min15: { type: Number, default: 6, min: 0 }, // 15 minutos
      min30: { type: Number, default: 9, min: 0 }, // 30 minutos
      min60: { type: Number, default: 10, min: 0 }, // 1 hora
      fullday: { type: Number, default: 11, min: 0 }, // Full day
      combo: { type: Number, default: 13, min: 0 }, // Combo Super Magico
    },

    // Paquetes de fiestas lunes-jueves y viernes-domingo
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
configSchema.statics.getConfig = async function (): Promise<IConfig> {
  let config = await this.findOne({ isSingleton: true });
  if (!config) config = await this.create({ isSingleton: true });
  return config;
};

// Actualiza la config
configSchema.statics.updateConfig = async function (updates: Partial<IConfig>): Promise<IConfig> {
  let config = await (this as any).getConfig();
  Object.assign(config, updates);
  await config.save();
  return config;
};

export default mongoose.model("Config", configSchema);
