// Panel de configuración, notificaciones y gráficas

// Valores por defecto de precios
const PRECIOS_DEFAULT = {
  moneda: "USD",
  tasaBCV: 244.65,
  tickets: {
    min15: 6,
    min30: 9,
    min60: 10,
    fullday: 11,
    combo: 13
  },
  paquetes: {
    mini: { lunes: 150, viernes: 180 },
    mediano: { lunes: 200, viernes: 230 },
    full: { lunes: 250, viernes: 280 }
  }
};

// Cargar configuración desde el backend
async function cargarConfiguracionDesdeBackend() {
  try {
    const config = await obtenerConfiguracion();
    return config;
  } catch (error) {
    console.error("Error cargando configuración del backend:", error);
    return PRECIOS_DEFAULT;
  }
}

// Guardar configuración en el backend
async function guardarConfiguracionEnBackend(config) {
  try {
    const resultado = await actualizarConfiguracion(config);
    return resultado;
  } catch (error) {
    console.error("Error guardando configuración en backend:", error);
    throw error;
  }
}

// Inicializar formulario de configuración con valores del backend
async function inicializarConfiguracion() {
  const config = await cargarConfiguracionDesdeBackend();

  // Cargar moneda y tasa
  const monedaSelect = document.getElementById("moneda-select");
  const tasaBcv = document.getElementById("tasa-bcv");

  if (monedaSelect) monedaSelect.value = config.moneda;
  if (tasaBcv) tasaBcv.value = config.tasaBCV;

  // Cargar precios de tickets
  const tickets = {
    "ticket-15min": config.tickets.min15,
    "ticket-30min": config.tickets.min30,
    "ticket-60min": config.tickets.min60,
    "ticket-fullday": config.tickets.fullday,
    "ticket-combo": config.tickets.combo
  };

  for (const [id, valor] of Object.entries(tickets)) {
    const elem = document.getElementById(id);
    if (elem) elem.value = valor;
  }

  // Cargar precios de paquetes
  const paquetes = {
    "mini-lunes": config.paquetes.mini.lunes,
    "mini-viernes": config.paquetes.mini.viernes,
    "mediano-lunes": config.paquetes.mediano.lunes,
    "mediano-viernes": config.paquetes.mediano.viernes,
    "full-lunes": config.paquetes.full.lunes,
    "full-viernes": config.paquetes.full.viernes
  };

  for (const [id, valor] of Object.entries(paquetes)) {
    const elem = document.getElementById(id);
    if (elem) elem.value = valor;
  }
}

// Guardar configuración desde el formulario al backend
async function guardarConfiguracionDesdeFormulario() {
  const monedaSeleccionada = document.getElementById("moneda-select")?.value || "USD";
  const tasaBCV = parseFloat(document.getElementById("tasa-bcv")?.value) || 244.65;

  // Obtener valores del formulario
  let min15 = parseFloat(document.getElementById("ticket-15min")?.value) || 6;
  let min30 = parseFloat(document.getElementById("ticket-30min")?.value) || 9;
  let min60 = parseFloat(document.getElementById("ticket-60min")?.value) || 10;
  let fullday = parseFloat(document.getElementById("ticket-fullday")?.value) || 11;
  let combo = parseFloat(document.getElementById("ticket-combo")?.value) || 13;

  let miniLunes = parseFloat(document.getElementById("mini-lunes")?.value) || 150;
  let miniViernes = parseFloat(document.getElementById("mini-viernes")?.value) || 180;
  let medianoLunes = parseFloat(document.getElementById("mediano-lunes")?.value) || 200;
  let medianoViernes = parseFloat(document.getElementById("mediano-viernes")?.value) || 230;
  let fullLunes = parseFloat(document.getElementById("full-lunes")?.value) || 250;
  let fullViernes = parseFloat(document.getElementById("full-viernes")?.value) || 280;

  // CORRECCIÓN CRÍTICA: Si la moneda actual es BS, los valores del formulario están en BS
  // y debemos convertirlos a USD antes de guardar (el backend siempre guarda en USD)
  if (monedaActual === "BS" && tasaBCV > 0) {
    min15 = min15 / tasaBCV;
    min30 = min30 / tasaBCV;
    min60 = min60 / tasaBCV;
    fullday = fullday / tasaBCV;
    combo = combo / tasaBCV;

    miniLunes = miniLunes / tasaBCV;
    miniViernes = miniViernes / tasaBCV;
    medianoLunes = medianoLunes / tasaBCV;
    medianoViernes = medianoViernes / tasaBCV;
    fullLunes = fullLunes / tasaBCV;
    fullViernes = fullViernes / tasaBCV;
  }

  const config = {
    moneda: monedaSeleccionada,
    tasaBCV: tasaBCV,
    tickets: {
      min15: parseFloat(min15.toFixed(2)),
      min30: parseFloat(min30.toFixed(2)),
      min60: parseFloat(min60.toFixed(2)),
      fullday: parseFloat(fullday.toFixed(2)),
      combo: parseFloat(combo.toFixed(2))
    },
    paquetes: {
      mini: {
        lunes: parseFloat(miniLunes.toFixed(2)),
        viernes: parseFloat(miniViernes.toFixed(2))
      },
      mediano: {
        lunes: parseFloat(medianoLunes.toFixed(2)),
        viernes: parseFloat(medianoViernes.toFixed(2))
      },
      full: {
        lunes: parseFloat(fullLunes.toFixed(2)),
        viernes: parseFloat(fullViernes.toFixed(2))
      }
    }
  };

  try {
    await guardarConfiguracionEnBackend(config);

    // CORRECCIÓN: Limpiar caché de precios originales para que se recarguen
    preciosOriginalesUSD = null;

    // CORRECCIÓN: Disparar evento personalizado para notificar a pricing.js
    window.dispatchEvent(new CustomEvent('configUpdated', { detail: config }));

    // CORRECCIÓN: Forzar recarga inmediata de precios en la página principal (si está cargada)
    if (typeof window.inicializarPreciosDinamicos === 'function') {
      window.inicializarPreciosDinamicos();
    }

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: "¡Configuración Guardada!",
        text: "Los precios se han actualizado en el servidor. Recarga la página principal para ver los cambios.",
        icon: "success",
        confirmButtonColor: "#7C3AED"
      });
    }

    console.log("Configuración guardada exitosamente:", config);
  } catch (error) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la configuración: " + error.message,
        icon: "error",
        confirmButtonColor: "#EF4444"
      });
    }
  }
}

// Restaurar valores por defecto
async function restaurarConfiguracionDefault() {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: "¿Restaurar valores por defecto?",
      text: "Se perderán todos los cambios personalizados",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await guardarConfiguracionEnBackend(PRECIOS_DEFAULT);
          await inicializarConfiguracion();

          Swal.fire({
            title: "Restaurado",
            text: "Se han restaurado los valores por defecto",
            icon: "success",
            confirmButtonColor: "#7C3AED"
          });
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "No se pudo restaurar la configuración",
            icon: "error",
            confirmButtonColor: "#EF4444"
          });
        }
      }
    });
  }
}

// Notificaciones

// Actualizar contador de notificaciones basado en reservas pendientes
function actualizarContadorNotificaciones() {
  // Verificar si la variable global reservas existe
  if (typeof reservas === 'undefined') return;

  const pendientes = reservas.filter(r => r.estadoReserva === "pendiente").length;
  const badge = document.getElementById("notification-count");

  if (badge) {
    badge.textContent = pendientes;
    badge.style.display = pendientes > 0 ? "block" : "none";
  }
}

// Mostrar panel de notificaciones
function mostrarNotificaciones() {
  const panel = document.getElementById("notifications-panel");
  const lista = document.getElementById("notifications-list");

  if (!panel || !lista) return;

  // Toggle panel visibility
  panel.classList.toggle("hidden");

  if (!panel.classList.contains("hidden")) {
    // Verificar si la variable global reservas existe
    if (typeof reservas === 'undefined') {
      lista.innerHTML = `
        <div class="notification-item">
          <div class="notification-title">No hay datos</div>
          <div class="notification-message">Cargando reservas...</div>
        </div>
      `;
      return;
    }

    // Generar lista de notificaciones con reservas pendientes
    const pendientes = reservas.filter(r => r.estadoReserva === "pendiente");

    if (pendientes.length === 0) {
      lista.innerHTML = `
        <div class="notification-item">
          <div class="notification-title">No hay notificaciones</div>
          <div class="notification-message">Todas las reservas están gestionadas</div>
        </div>
      `;
    } else {
      lista.innerHTML = pendientes.map(r => `
        <div class="notification-item unread" data-id="${r._id}">
          <div class="notification-title">Nueva reserva pendiente</div>
          <div class="notification-message">
            ${r.nombreCompleto} - ${r.parque} - ${r.fechaServicio}
          </div>
          <div class="notification-time">Pendiente de aprobación</div>
        </div>
      `).join("");

      // Event listeners para cada notificación - al hacer click va a la sección de reservas
      lista.querySelectorAll(".notification-item").forEach(item => {
        item.addEventListener("click", () => {
          panel.classList.add("hidden");
          // Cambiar a sección de reservas si la función existe
          if (typeof cambiarSeccion === 'function') {
            cambiarSeccion("reservas");
          }
        });
      });
    }
  }
}

// GRÁFICA DE DONA - DISTRIBUCIÓN POR PARQUE

let parqueChart = null;

// Renderizar gráfica de distribución de reservas por parque
function renderizarGraficaParques() {
  const canvas = document.getElementById("parque-dona-chart");
  if (!canvas) return;

  // Verificar si Chart.js está disponible
  if (typeof Chart === 'undefined') {
    console.error("Chart.js no está cargado");
    return;
  }

  // Verificar si la variable global reservas existe
  if (typeof reservas === 'undefined' || reservas.length === 0) {
    return;
  }

  const ctx = canvas.getContext("2d");

  // Destruir gráfica anterior si existe para evitar duplicados
  if (parqueChart) {
    parqueChart.destroy();
  }

  // Contar reservas por parque
  const conteoParques = {
    "Maracaibo": 0,
    "Caracas": 0,
    "Punto Fijo": 0
  };

  reservas.forEach(r => {
    if (conteoParques.hasOwnProperty(r.parque)) {
      conteoParques[r.parque]++;
    }
  });

  // Crear gráfica de dona
  parqueChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Maracaibo", "Caracas", "Punto Fijo"],
      datasets: [{
        data: [
          conteoParques["Maracaibo"],
          conteoParques["Caracas"],
          conteoParques["Punto Fijo"]
        ],
        backgroundColor: [
          "rgba(124, 58, 237, 0.8)",   // Morado para Maracaibo
          "rgba(16, 185, 129, 0.8)",   // Verde para Caracas
          "rgba(245, 158, 11, 0.8)"    // Naranja para Punto Fijo
        ],
        borderColor: [
          "rgba(124, 58, 237, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)"
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              family: "Outfit",
              size: 14
            },
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Inicialización

// Variables globales para conversión
let preciosOriginalesUSD = null;
let monedaActual = "USD";

// Guardar precios originales en USD
function guardarPreciosOriginales() {
  if (!preciosOriginalesUSD) {
    preciosOriginalesUSD = {
      tickets: {
        min15: parseFloat(document.getElementById("ticket-15min")?.value) || 6,
        min30: parseFloat(document.getElementById("ticket-30min")?.value) || 9,
        min60: parseFloat(document.getElementById("ticket-60min")?.value) || 10,
        fullday: parseFloat(document.getElementById("ticket-fullday")?.value) || 11,
        combo: parseFloat(document.getElementById("ticket-combo")?.value) || 13
      },
      paquetes: {
        mini: {
          lunes: parseFloat(document.getElementById("mini-lunes")?.value) || 150,
          viernes: parseFloat(document.getElementById("mini-viernes")?.value) || 180
        },
        mediano: {
          lunes: parseFloat(document.getElementById("mediano-lunes")?.value) || 200,
          viernes: parseFloat(document.getElementById("mediano-viernes")?.value) || 230
        },
        full: {
          lunes: parseFloat(document.getElementById("full-lunes")?.value) || 250,
          viernes: parseFloat(document.getElementById("full-viernes")?.value) || 280
        }
      }
    };
  }
}

// Convertir precios según moneda seleccionada
function convertirPrecios(moneda) {
  const tasaBCV = parseFloat(document.getElementById("tasa-bcv")?.value) || 244.65;

  if (!preciosOriginalesUSD) {
    guardarPreciosOriginales();
  }

  // Si cambiamos a BS, convertir
  if (moneda === "BS") {
    // Convertir tickets
    document.getElementById("ticket-15min").value = (preciosOriginalesUSD.tickets.min15 * tasaBCV).toFixed(2);
    document.getElementById("ticket-30min").value = (preciosOriginalesUSD.tickets.min30 * tasaBCV).toFixed(2);
    document.getElementById("ticket-60min").value = (preciosOriginalesUSD.tickets.min60 * tasaBCV).toFixed(2);
    document.getElementById("ticket-fullday").value = (preciosOriginalesUSD.tickets.fullday * tasaBCV).toFixed(2);
    document.getElementById("ticket-combo").value = (preciosOriginalesUSD.tickets.combo * tasaBCV).toFixed(2);

    // Convertir paquetes
    document.getElementById("mini-lunes").value = (preciosOriginalesUSD.paquetes.mini.lunes * tasaBCV).toFixed(2);
    document.getElementById("mini-viernes").value = (preciosOriginalesUSD.paquetes.mini.viernes * tasaBCV).toFixed(2);
    document.getElementById("mediano-lunes").value = (preciosOriginalesUSD.paquetes.mediano.lunes * tasaBCV).toFixed(2);
    document.getElementById("mediano-viernes").value = (preciosOriginalesUSD.paquetes.mediano.viernes * tasaBCV).toFixed(2);
    document.getElementById("full-lunes").value = (preciosOriginalesUSD.paquetes.full.lunes * tasaBCV).toFixed(2);
    document.getElementById("full-viernes").value = (preciosOriginalesUSD.paquetes.full.viernes * tasaBCV).toFixed(2);
  } else {
    // Si volvemos a USD, restaurar valores originales
    document.getElementById("ticket-15min").value = preciosOriginalesUSD.tickets.min15;
    document.getElementById("ticket-30min").value = preciosOriginalesUSD.tickets.min30;
    document.getElementById("ticket-60min").value = preciosOriginalesUSD.tickets.min60;
    document.getElementById("ticket-fullday").value = preciosOriginalesUSD.tickets.fullday;
    document.getElementById("ticket-combo").value = preciosOriginalesUSD.tickets.combo;

    document.getElementById("mini-lunes").value = preciosOriginalesUSD.paquetes.mini.lunes;
    document.getElementById("mini-viernes").value = preciosOriginalesUSD.paquetes.mini.viernes;
    document.getElementById("mediano-lunes").value = preciosOriginalesUSD.paquetes.mediano.lunes;
    document.getElementById("mediano-viernes").value = preciosOriginalesUSD.paquetes.mediano.viernes;
    document.getElementById("full-lunes").value = preciosOriginalesUSD.paquetes.full.lunes;
    document.getElementById("full-viernes").value = preciosOriginalesUSD.paquetes.full.viernes;
  }

  monedaActual = moneda;
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("Funcionalidades finales cargadas");

  // Event listeners para configuración
  const guardarBtn = document.getElementById("guardar-config-btn");
  const resetBtn = document.getElementById("reset-config-btn");
  const closeNotifBtn = document.getElementById("close-notifications");
  const monedaSelect = document.getElementById("moneda-select");
  const tasaBcvInput = document.getElementById("tasa-bcv");

  if (guardarBtn) {
    guardarBtn.addEventListener("click", guardarConfiguracionDesdeFormulario);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", restaurarConfiguracionDefault);
  }

  // Event listener para cambio de moneda
  if (monedaSelect) {
    monedaSelect.addEventListener("change", (e) => {
      convertirPrecios(e.target.value);
    });
  }

  // Event listener para cambio de tasa BCV
  if (tasaBcvInput) {
    tasaBcvInput.addEventListener("change", () => {
      if (monedaActual === "BS") {
        convertirPrecios("BS");
      }
    });
  }

  // Event listener para cerrar panel de notificaciones
  if (closeNotifBtn) {
    closeNotifBtn.addEventListener("click", () => {
      const panel = document.getElementById("notifications-panel");
      if (panel) panel.classList.add("hidden");
    });
  }

  // Inicializar configuración al hacer click en la sección
  const configNav = document.querySelector('.nav-item[data-section="configuracion"]');
  if (configNav) {
    configNav.addEventListener("click", () => {
      setTimeout(() => {
        inicializarConfiguracion();
        setTimeout(guardarPreciosOriginales, 200);
      }, 100);
    });
  }

  // Actualizar notificaciones cada 30 segundos si hay reservas
  setInterval(() => {
    if (typeof reservas !== 'undefined') {
      actualizarContadorNotificaciones();
    }
  }, 30000);
});
