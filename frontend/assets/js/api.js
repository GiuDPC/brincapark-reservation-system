// api.js - Módulo de comunicación con el backend
const API_URL = "http://localhost:4000/api";

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
    console.error("Backend no disponible:", error);
    return false;
  }
}
