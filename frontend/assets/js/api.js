// api.js - Módulo de comunicación con el backend

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const RENDER_URL = "https://brincapark-api.onrender.com/api";
const API_URL = isLocal ? "http://localhost:4000/api" : RENDER_URL;
console.log("API configurada para:", isLocal ? "Entorno Local" : "Producción (Render)");

/**
 * Crear una nueva reserva desde el formulario publico
 * @param {Object} datos - Datos del formulario
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function crearReserva(datos) {
  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al crear reserva");
    }

    return data;
  } catch (error) {
    console.error("Error en crearReserva:", error);
    throw error;
  }
}

/**
 * Listar todas las reservas en la parde del administrador
 * @param {string} adminSecret - Secret de administrador
 * @returns {Promise<Array>} Lista de reservas
 */
async function listarReservas(adminSecret) {
  try {
    const response = await fetch(`${API_URL}/admin/reservas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al listar reservas");
    }

    return data;
  } catch (error) {
    console.error("Error en listarReservas:", error);
    throw error;
  }
}

/**
 * Cambiar estado de una reserva desde panel administrador
 * @param {string} id - ID de la reserva
 * @param {string} estado - Nuevo estado (pendiente/aprobado/cancelado)
 * @param {string} adminSecret - Secret de administrador
 * @returns {Promise<Object>} Reserva actualizada
 */
async function cambiarEstadoReserva(id, estado, adminSecret) {
  try {
    const response = await fetch(`${API_URL}/admin/reservas/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
      body: JSON.stringify({ estado }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al cambiar estado");
    }

    return data;
  } catch (error) {
    console.error("Error en cambiarEstadoReserva:", error);
    throw error;
  }
}

/**
 * Eliminar una reserva desde el panel administrador
 * @param {string} id - ID de la reserva
 * @param {string} adminSecret - Secret de administrador
 * @returns {Promise<Object>} Confirmación de eliminación
 */
async function eliminarReserva(id, adminSecret) {
  try {
    const response = await fetch(`${API_URL}/admin/reservas/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": adminSecret,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar reserva");
    }

    return data;
  } catch (error) {
    console.error("Error en eliminarReserva:", error);
    throw error;
  }
}

/**
 * Verificar si el backend está disponible para comunicarse con él desde el frontend público
 * @returns {Promise<boolean>}
 */
async function verificarBackend() {
  try {
    const response = await fetch(`${API_URL.replace("/api", "")}/`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// ==========================================
// CONFIGURACIÓN Y PRECIOS
// ==========================================

/**
 * Obtener configuración actual del sistema
 * @returns {Promise<Object>} Configuración
 */
async function obtenerConfiguracion() {
  try {
    const response = await fetch(`${API_URL}/config`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener configuración");
    }
    return data;
  } catch (error) {
    console.error("Error en obtenerConfiguracion:", error);
    throw error;
  }
}

/**
 * Actualizar configuración del sistema
 * @param {Object} config - Nueva configuración
 * @returns {Promise<Object>} Configuración actualizada
 */
async function actualizarConfiguracion(config) {
  try {
    const response = await fetch(`${API_URL}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar configuración");
    }
    return data;
  } catch (error) {
    console.error("Error en actualizarConfiguracion:", error);
    throw error;
  }
}

/**
 * Obtener precios convertidos según moneda actual
 * @returns {Promise<Object>} Precios
 */
async function obtenerPrecios() {
  try {
    const response = await fetch(`${API_URL}/config/precios`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener precios");
    }
    return data;
  } catch (error) {
    console.error("Error en obtenerPrecios:", error);
    throw error;
  }
}

// ==========================================
// ANALYTICS Y ESTADÍSTICAS
// ==========================================

/**
 * Obtener estadísticas avanzadas
 * @returns {Promise<Object>} Estadísticas
 */
async function obtenerEstadisticas() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/stats`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener estadísticas");
    }
    return data;
  } catch (error) {
    console.error("Error en obtenerEstadisticas:", error);
    throw error;
  }
}

/**
 * Obtener datos mensuales (últimos 6 meses)
 * @returns {Promise<Object>} Datos mensuales
 */
async function obtenerDatosMensuales() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/monthly`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener datos mensuales");
    }
    return data;
  } catch (error) {
    console.error("Error en obtenerDatosMensuales:", error);
    throw error;
  }
}

/**
 * Obtener top clientes frecuentes
 * @returns {Promise<Array>} Top clientes
 */
async function obtenerTopClientes() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/top-clients`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener top clientes");
    }
    return data;
  } catch (error) {
    console.error("Error en obtenerTopClientes:", error);
    throw error;
  }
}

/**
 * Obtener análisis de cancelaciones
 * @returns {Promise<Object>}
 */
async function obtenerAnalisisCancelaciones() {
  try {
    const response = await fetch(`${API_URL}/reservations/analytics/cancellations`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener análisis de cancelaciones");
    }
    return data;
  } catch (error) {
    console.error("Error en obtenerAnalisisCancelaciones:", error);
    throw error;
  }
}

// Exportar para uso global
window.API_BASE_URL = API_URL;