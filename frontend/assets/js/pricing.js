const isLocalPricing = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_PRICING = isLocalPricing ? "http://localhost:4000/api" : "https://brincapark-api.onrender.com/api";

let currentConfig = null;
let pollingInterval = null;
const CACHE_KEY = "brincapark_precios_cache";
const CACHE_DURATION = 5 * 60 * 1000;

function guardarEnCache(config) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ config, timestamp: Date.now() }));
  } catch (e) {
    console.warn("No se pudo guardar en caché:", e);
  }
}

function obtenerDeCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const cacheData = JSON.parse(cached);
    return (Date.now() - cacheData.timestamp < CACHE_DURATION) ? cacheData.config : cacheData.config;
  } catch (e) {
    return null;
  }
}

async function obtenerConfiguracionPrecios() {
  try {
    const response = await fetch(`${API_PRICING}/config/precios?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache' }
    });
    if (!response.ok) throw new Error("Error al obtener precios");
    const data = await response.json();
    guardarEnCache(data);
    return data;
  } catch (error) {
    console.error("Error obteniendo precios:", error);
    return obtenerDeCache();
  }
}

function formatearMoneda(valor, moneda) {
  const valorFormateado = parseFloat(valor).toFixed(2);
  return moneda === "USD" ? `$${valorFormateado}` : `Bs ${valorFormateado}`;
}

function actualizarPreciosUI(config) {
  if (!config) return;
  currentConfig = config;
  const moneda = config.moneda;

  const indicadorMoneda = document.getElementById("moneda-actual");
  if (indicadorMoneda) indicadorMoneda.textContent = moneda === "USD" ? "Dólares (USD)" : "Bolívares (Bs)";

  const tickets = {
    "precio-15min": config.tickets?.min15?.actual,
    "precio-30min": config.tickets?.min30?.actual,
    "precio-60min": config.tickets?.min60?.actual,
    "precio-fullday": config.tickets?.fullday?.actual,
    "precio-combo": config.tickets?.combo?.actual,
  };

  Object.entries(tickets).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);
    if (elemento && valor !== undefined) elemento.textContent = formatearMoneda(valor, moneda);
  });

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
    if (elemento && valor !== undefined) elemento.textContent = formatearMoneda(valor, moneda);
  });
}

function mostrarSkeletonPrecios() {
  const allIds = ["precio-15min", "precio-30min", "precio-60min", "precio-fullday", "precio-combo",
    "precio-mini-lunes", "precio-mini-viernes", "precio-mediano-lunes", "precio-mediano-viernes",
    "precio-full-lunes", "precio-full-viernes"];

  allIds.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.classList.add('skeleton');
      elemento.textContent = '$---.--';
    }
  });
}

function ocultarSkeletonPrecios() {
  document.querySelectorAll('.skeleton').forEach(el => el.classList.remove('skeleton'));
}

async function inicializarPreciosDinamicos() {
  const cached = obtenerDeCache();
  if (cached) {
    actualizarPreciosUI(cached);
    console.log("✓ Precios cargados desde caché");
  } else {
    mostrarSkeletonPrecios();
  }

  const config = await obtenerConfiguracionPrecios();
  if (config) {
    ocultarSkeletonPrecios();
    if (JSON.stringify(currentConfig) !== JSON.stringify(config)) {
      actualizarPreciosUI(config);
      console.log("✓ Precios actualizados desde servidor");
    }
  }

  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    const nuevaConfig = await obtenerConfiguracionPrecios();
    if (nuevaConfig && JSON.stringify(currentConfig) !== JSON.stringify(nuevaConfig)) {
      actualizarPreciosUI(nuevaConfig);
    }
  }, 10000);
}

function detenerPreciosDinamicos() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

window.addEventListener('configUpdated', async () => {
  localStorage.removeItem(CACHE_KEY);
  currentConfig = null;
  const config = await obtenerConfiguracionPrecios();
  if (config) actualizarPreciosUI(config);
});

window.addEventListener('pageshow', async (event) => {
  if (event.persisted) {
    const cached = obtenerDeCache();
    if (cached) actualizarPreciosUI(cached);
    const config = await obtenerConfiguracionPrecios();
    if (config && JSON.stringify(currentConfig) !== JSON.stringify(config)) {
      actualizarPreciosUI(config);
    }
  }
});

let lastFocusCheck = 0;
window.addEventListener('focus', async () => {
  if (Date.now() - lastFocusCheck < 5000) return;
  lastFocusCheck = Date.now();
  const config = await obtenerConfiguracionPrecios();
  if (config && JSON.stringify(currentConfig) !== JSON.stringify(config)) {
    actualizarPreciosUI(config);
  }
});

window.inicializarPreciosDinamicos = inicializarPreciosDinamicos;
window.detenerPreciosDinamicos = detenerPreciosDinamicos;
window.obtenerConfiguracionPrecios = obtenerConfiguracionPrecios;
window.formatearMoneda = formatearMoneda;