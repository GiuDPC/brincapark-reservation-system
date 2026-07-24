const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const RENDER_URL = "https://brincapark-api.onrender.com/api";
const API_URL = isLocal ? "http://localhost:4000/api" : RENDER_URL;
console.log("API configurada para:", isLocal ? "Entorno Local" : "Producción (Render)");

async function crearReserva(datos) {
  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al crear reserva");
    return data;
  } catch (error) {
    console.error("Error en crearReserva:", error);
    throw error;
  }
}

async function obtenerConfiguracion() {
  try {
    const response = await fetch(`${API_URL}/config`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al obtener configuración");
    return data;
  } catch (error) {
    console.error("Error en obtenerConfiguracion:", error);
    throw error;
  }
}

async function actualizarConfiguracion(config) {
  try {
    const response = await fetch(`${API_URL}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al actualizar configuración");
    return data;
  } catch (error) {
    console.error("Error en actualizarConfiguracion:", error);
    throw error;
  }
}

async function obtenerPrecios() {
  try {
    const response = await fetch(`${API_URL}/config/precios`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al obtener precios");
    return data;
  } catch (error) {
    console.error("Error en obtenerPrecios:", error);
    throw error;
  }
}

async function obtenerEstadisticas() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/stats`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al obtener estadísticas");
    return data;
  } catch (error) {
    console.error("Error en obtenerEstadisticas:", error);
    throw error;
  }
}

async function obtenerDatosMensuales() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/monthly`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al obtener datos mensuales");
    return data;
  } catch (error) {
    console.error("Error en obtenerDatosMensuales:", error);
    throw error;
  }
}

async function obtenerTopClientes() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/top-clients`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al obtener top clientes");
    return data;
  } catch (error) {
    console.error("Error en obtenerTopClientes:", error);
    throw error;
  }
}

async function obtenerAnalisisCancelaciones() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/cancellations`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Error al obtener análisis de cancelaciones");
    return data;
  } catch (error) {
    console.error("Error en obtenerAnalisisCancelaciones:", error);
    throw error;
  }
}

window.API_BASE_URL = API_URL;