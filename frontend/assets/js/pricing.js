// pricing.js - Sistema de precios dinámicos OPTIMIZADO para BRINCAPARK
// Versión 2.1 - Carga instantánea con caché local

// Detección de entorno
const isLocalPricing = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_PRICING = isLocalPricing ? "http://localhost:4000/api" : "https://brincapark-api.onrender.com/api";

// Variables globales
let currentConfig = null;
let pollingInterval = null;
const CACHE_KEY = "brincapark_precios_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de caché válido

// ==========================================
// FUNCIONES DE CACHÉ LOCAL
// ==========================================

// Guardar precios en localStorage
function guardarEnCache(config) {
  try {
    const cacheData = {
      config: config,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.warn("No se pudo guardar en caché local:", e);
  }
}

// Obtener precios del localStorage
function obtenerDeCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    // Verificar si el caché sigue siendo válido
    if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
      return cacheData.config;
    }
    return cacheData.config; // Devolver aunque sea viejo para mostrar algo
  } catch (e) {
    return null;
  }
}

// ==========================================
// FUNCIONES PRINCIPALES
// ==========================================

// Obtener configuración de precios del backend
async function obtenerConfiguracionPrecios() {
  try {
    const urlSinCache = `${API_PRICING}/config/precios?t=${Date.now()}`;

    const response = await fetch(urlSinCache, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache' }
    });

    if (!response.ok) throw new Error("Error al obtener precios");
    const data = await response.json();

    // Guardar en caché local para próxima carga instantánea
    guardarEnCache(data);

    return data;
  } catch (error) {
    console.error("Error obteniendo precios:", error);
    // Si falla, intentar devolver del caché
    return obtenerDeCache();
  }
}

// Formatear moneda según el tipo
function formatearMoneda(valor, moneda) {
  const valorFormateado = parseFloat(valor).toFixed(2);
  return moneda === "USD" ? `$${valorFormateado}` : `Bs ${valorFormateado}`;
}

// Actualizar precios en la UI (versión optimizada, menos logs)
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
    "precio-15min": config.tickets?.min15?.actual,
    "precio-30min": config.tickets?.min30?.actual,
    "precio-60min": config.tickets?.min60?.actual,
    "precio-fullday": config.tickets?.fullday?.actual,
    "precio-combo": config.tickets?.combo?.actual,
  };

  Object.entries(tickets).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);
    if (elemento && valor !== undefined) {
      elemento.textContent = formatearMoneda(valor, moneda);
    }
  });

  // Actualizar precios de paquetes
  const paquetes = {
    "precio-mini-lunes": config.paquetes?.mini?.lunes?.actual,
    "precio-mini-viernes": config.paquetes?.mini?.viernes?.actual,
    "precio-mediano-lunes": config.paquetes?.mediano?.lunes?.actual,
    "precio-mediano-viernes": config.paquetes?.mediano?.viernes?.actual,
    "precio-full-lunes": config.paquetes?.full?.lunes?.actual,
    "precio-full-viernes": config.paquetes?.full?.viernes?.actual,
  };

  Object.entries(paquetes).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);
    if (elemento && valor !== undefined) {
      elemento.textContent = formatearMoneda(valor, moneda);
    }
  });
}

// ==========================================
// INICIALIZACIÓN OPTIMIZADA
// ==========================================

async function inicializarPreciosDinamicos() {
  // PASO 1: Mostrar precios del caché INMEDIATAMENTE
  const cached = obtenerDeCache();
  if (cached) {
    actualizarPreciosUI(cached);
    console.log("✓ Precios cargados instantáneamente desde caché");
  }

  // PASO 2: Obtener precios frescos del servidor en segundo plano
  const config = await obtenerConfiguracionPrecios();
  if (config) {
    // Solo actualizar UI si los precios cambiaron
    if (JSON.stringify(currentConfig) !== JSON.stringify(config)) {
      actualizarPreciosUI(config);
      console.log("✓ Precios actualizados desde servidor");
    }
  }

  // PASO 3: Polling cada 30 segundos (no tan agresivo)
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    const nuevaConfig = await obtenerConfiguracionPrecios();
    if (nuevaConfig && JSON.stringify(currentConfig) !== JSON.stringify(nuevaConfig)) {
      actualizarPreciosUI(nuevaConfig);
    }
  }, 10000); // 10 segundos - actualización rápida
}

// Detener polling
function detenerPreciosDinamicos() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// ==========================================
// EVENT LISTENERS OPTIMIZADOS
// ==========================================

// Escuchar evento de actualización desde admin
window.addEventListener('configUpdated', async () => {
  // Limpiar caché viejo
  localStorage.removeItem(CACHE_KEY);
  currentConfig = null;

  const config = await obtenerConfiguracionPrecios();
  if (config) actualizarPreciosUI(config);
});

// Recargar al volver a la página (navegación atrás/adelante)
window.addEventListener('pageshow', async (event) => {
  if (event.persisted) {
    // Mostrar caché primero
    const cached = obtenerDeCache();
    if (cached) actualizarPreciosUI(cached);

    // Luego actualizar del servidor
    const config = await obtenerConfiguracionPrecios();
    if (config && JSON.stringify(currentConfig) !== JSON.stringify(config)) {
      actualizarPreciosUI(config);
    }
  }
});

// Recargar cuando la ventana recibe foco
let lastFocusCheck = 0;
window.addEventListener('focus', async () => {
  // Evitar múltiples llamadas seguidas (throttle de 5 segundos)
  if (Date.now() - lastFocusCheck < 5000) return;
  lastFocusCheck = Date.now();

  const config = await obtenerConfiguracionPrecios();
  if (config && JSON.stringify(currentConfig) !== JSON.stringify(config)) {
    actualizarPreciosUI(config);
  }
});

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================
window.inicializarPreciosDinamicos = inicializarPreciosDinamicos;
window.detenerPreciosDinamicos = detenerPreciosDinamicos;
window.obtenerConfiguracionPrecios = obtenerConfiguracionPrecios;
window.formatearMoneda = formatearMoneda;