//MODELO DE CONFIGURACIÓN DEL SISTEMA

//Este modelo maneja toda la configuración (la seccion de configuracion que podemos ver en el panel administrativo) del sistema BRINCAPARK:
// Moneda USD o Bolívares
//Tasa de cambio BCV
//Precios de tickets
//Precios de paquetes de fiestas

//Solo existe iun documento de configuración en toda la base de datos
//Esto asegura que todos los precios y configuraciones sean consistentes

//Y por que guardo esto en la base de datos y no en codigo por que:
// Permite cambiar precios sin redeployar el servidor
// El admin puede actualizar precios desde el panel
// Mantiene historial de cambios

const mongoose = require("mongoose");

// Schema de Configuración
// Define todos los parámetros configurables del sistema

const configSchema = new mongoose.Schema(
  {
    // CONFIGURACIÓN DE MONEDA

    //Moneda principal del sistema
    //USD Dólares estadounidenses
    //BS Bolívares venezolanos

    moneda: {
      type: String,
      enum: ["USD", "BS"],
      default: "USD",
      required: true,
    },

    // Tasa de cambio del Banco Central de Venezuela
    // Cuántos bolívares equivalen a 1 dólar
    // Ejemplo: 244.65 significa que 1 USD = 244.65 Bs
    // Este valor debe actualizarse regularmente según la tasa oficial

    tasaBCV: {
      type: Number,
      default: 244.65,
      min: 0,
      required: true,
    },

    // PRECIOS DE TICKETS INDIVIDUALES

    // Precios de tickets por tiempo de uso
    // Todos los precios están en la moneda configurada arriba

    tickets: {
      min15: { type: Number, default: 6, min: 0 }, // 15 minutos
      min30: { type: Number, default: 9, min: 0 }, // 30 minutos
      min60: { type: Number, default: 10, min: 0 }, // 1 hora
      fullday: { type: Number, default: 11, min: 0 }, // Día completo
      combo: { type: Number, default: 13, min: 0 }, // Combo especial
    },

    // PRECIOS DE PAQUETES DE FIESTAS

    //Paquetes para eventos y fiestas
    //Cada paquete tiene dos precios:
    // lunes: Precio de lunes a jueves (más económico)
    // viernes: Precio de viernes a domingo (fin de semana)
    paquetes: {
      // Paquete Mini de Hasta 30 personas
      mini: {
        lunes: { type: Number, default: 150, min: 0 },
        viernes: { type: Number, default: 180, min: 0 },
      },
      // Paquete Mediano de Hasta 60 personas
      mediano: {
        lunes: { type: Number, default: 200, min: 0 },
        viernes: { type: Number, default: 230, min: 0 },
      },
      // Paquete Full de Hasta 80 personas
      full: {
        lunes: { type: Number, default: 250, min: 0 },
        viernes: { type: Number, default: 280, min: 0 },
      },
    },

    // CONTROL

    // Campo especial para garantizar que solo exista un documento de configuración
    // Este campo es único en toda la colección
    // Siempre es true, y como es unique, solo puede haber un documento con true

    isSingleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  {
    // Mongoose agregará automaticamente createdAt y updatedAt
    timestamps: true,
  }
);

// METODOS ESTATICOS

/**
 * Obtiene la configuración única del sistema
 * Si no existe, la crea con valores por defecto
 *
 * @returns {Promise<Object>} El documento de configuración
 */
configSchema.statics.getConfig = async function () {
  // buscamos el documento de configuración
  let config = await this.findOne({ isSingleton: true });

  // Si no existe lo creamos con valores por defecto
  if (!config) {
    config = await this.create({ isSingleton: true });
  }

  return config;
};

/**
 * Actualiza la configuración del sistema
 *
 * @param {Object} updates - Objeto con los campos a actualizar
 * @returns {Promise<Object>} La configuración actualizada
 *
 * Ejemplo de uso:
 * await Config.updateConfig({ tasaBCV: 250.00, moneda: 'BS' });
 */
configSchema.statics.updateConfig = async function (updates) {
  // Primero obtenemos la configuración actual
  let config = await this.getConfig();

  // Aplicamos los cambios
  Object.assign(config, updates);

  // Guardamos en la base de datos
  await config.save();

  return config;
};

// Creamos y exportamos el modelo
module.exports = mongoose.model("Config", configSchema);
