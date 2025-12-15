// pricing.js - Sistema de precios dinámicos para BRINCAPARK

const API_PRICING = window.API_BASE_URL || "http://localhost:4000/api";

let currentConfig = null;
let pollingInterval = null;

// Obtener configuración de precios del backend
async function obtenerConfiguracionPrecios() {
  try {
    // CORRECCIÓN VITAL: Agregamos timestamp (?t=...) para romper el caché
    const urlSinCache = `${API_PRICING}/config/precios?t=${new Date().getTime()}`;
    
    const response = await fetch(urlSinCache, { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache' }
    });
    
    if (!response.ok) throw new Error("Error al obtener precios");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error obteniendo configuración de precios:", error);
    return null;
  }
}

// Formatear moneda según el tipo
function formatearMoneda(valor, moneda) {
  const valorFormateado = parseFloat(valor).toFixed(2);
  return moneda === "USD" ? `$${valorFormateado}` : `Bs ${valorFormateado}`;
}

// Actualizar precios en la UI
function actualizarPreciosUI(config) {
  if (!config) return;
  currentConfig = config;
  const moneda = config.moneda;

  // Actualizar indicador de moneda
  const indicadorMoneda = document.getElementById("moneda-actual");
  if (indicadorMoneda) {
    indicadorMoneda.textContent = moneda === "USD" ? "Dólares (USD)" : "Bolívares (Bs)";
  }

  // Actualizar precios de tickets
  const tickets = {
    "precio-15min": config.tickets.min15?.actual,
    "precio-30min": config.tickets.min30?.actual,
    "precio-60min": config.tickets.min60?.actual,
    "precio-fullday": config.tickets.fullday?.actual,
    "precio-combo": config.tickets.combo?.actual,
  };

  Object.keys(tickets).forEach((id) => {
    const elemento = document.getElementById(id);
    if (elemento && tickets[id] !== undefined) {
      elemento.textContent = formatearMoneda(tickets[id], moneda);
    }
  });

  // Actualizar precios de paquetes
  const paquetes = {
    "precio-mini-lunes": config.paquetes.mini?.lunes?.actual,
    "precio-mini-viernes": config.paquetes.mini?.viernes?.actual,
    "precio-mediano-lunes": config.paquetes.mediano?.lunes?.actual,
    "precio-mediano-viernes": config.paquetes.mediano?.viernes?.actual,
    "precio-full-lunes": config.paquetes.full?.lunes?.actual,
    "precio-full-viernes": config.paquetes.full?.viernes?.actual,
  };

  Object.keys(paquetes).forEach((id) => {
    const elemento = document.getElementById(id);
    if (elemento && paquetes[id] !== undefined) {
      elemento.textContent = formatearMoneda(paquetes[id], moneda);
    }
  });
  
  console.log("Precios actualizados en pantalla:", moneda);
}

// Inicializar sistema de precios dinámicos
async function inicializarPreciosDinamicos() {
  // Cargar precios iniciales
  const config = await obtenerConfiguracionPrecios();
  if (config) {
    actualizarPreciosUI(config);
  }

  // Polling cada 10 segundos (más rápido) para detectar cambios
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    const nuevaConfig = await obtenerConfiguracionPrecios();
    if (nuevaConfig) {
      // CORRECCIÓN: Comparamos TODO el objeto JSON.
      // Si cambiaste un precio, el JSON será diferente y actualizará.
      if (JSON.stringify(currentConfig) !== JSON.stringify(nuevaConfig)) {
        console.log("Cambio detectado, actualizando UI...");
        actualizarPreciosUI(nuevaConfig);
      }
    }
  }, 10000); // 10 segundos
}

// Detener polling
function detenerPreciosDinamicos() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// Exportar funciones
window.inicializarPreciosDinamicos = inicializarPreciosDinamicos;
window.detenerPreciosDinamicos = detenerPreciosDinamicos;
window.obtenerConfiguracionPrecios = obtenerConfiguracionPrecios;
window.formatearMoneda = formatearMoneda;