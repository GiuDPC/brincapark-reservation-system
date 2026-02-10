const PRECIOS_DEFAULT = {
  moneda: "USD",
  tasaBCV: 244.65,
  tickets: { min15: 6, min30: 9, min60: 10, fullday: 11, combo: 13 },
  paquetes: {
    mini: { lunes: 150, viernes: 180 },
    mediano: { lunes: 200, viernes: 230 },
    full: { lunes: 250, viernes: 280 }
  }
};

async function cargarConfiguracionDesdeBackend() {
  try {
    return await obtenerConfiguracion();
  } catch (error) {
    console.error("Error cargando configuración:", error);
    return PRECIOS_DEFAULT;
  }
}

async function guardarConfiguracionEnBackend(config) {
  try {
    return await actualizarConfiguracion(config);
  } catch (error) {
    console.error("Error guardando configuración:", error);
    throw error;
  }
}

async function inicializarConfiguracion() {
  const config = await cargarConfiguracionDesdeBackend();

  const monedaSelect = document.getElementById("moneda-select");
  const tasaBcv = document.getElementById("tasa-bcv");
  if (monedaSelect) monedaSelect.value = config.moneda;
  if (tasaBcv) tasaBcv.value = config.tasaBCV;

  const tickets = {
    "ticket-15min": config.tickets.min15, "ticket-30min": config.tickets.min30,
    "ticket-60min": config.tickets.min60, "ticket-fullday": config.tickets.fullday,
    "ticket-combo": config.tickets.combo
  };
  for (const [id, valor] of Object.entries(tickets)) {
    const elem = document.getElementById(id);
    if (elem) elem.value = valor;
  }

  const paquetes = {
    "mini-lunes": config.paquetes.mini.lunes, "mini-viernes": config.paquetes.mini.viernes,
    "mediano-lunes": config.paquetes.mediano.lunes, "mediano-viernes": config.paquetes.mediano.viernes,
    "full-lunes": config.paquetes.full.lunes, "full-viernes": config.paquetes.full.viernes
  };
  for (const [id, valor] of Object.entries(paquetes)) {
    const elem = document.getElementById(id);
    if (elem) elem.value = valor;
  }
}

async function guardarConfiguracionDesdeFormulario() {
  const monedaSeleccionada = document.getElementById("moneda-select")?.value || "USD";
  const tasaBCV = parseFloat(document.getElementById("tasa-bcv")?.value) || 244.65;

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

  if (monedaActual === "BS" && tasaBCV > 0) {
    min15 /= tasaBCV; min30 /= tasaBCV; min60 /= tasaBCV; fullday /= tasaBCV; combo /= tasaBCV;
    miniLunes /= tasaBCV; miniViernes /= tasaBCV; medianoLunes /= tasaBCV;
    medianoViernes /= tasaBCV; fullLunes /= tasaBCV; fullViernes /= tasaBCV;
  }

  const config = {
    moneda: monedaSeleccionada,
    tasaBCV: tasaBCV,
    tickets: {
      min15: parseFloat(min15.toFixed(2)), min30: parseFloat(min30.toFixed(2)),
      min60: parseFloat(min60.toFixed(2)), fullday: parseFloat(fullday.toFixed(2)),
      combo: parseFloat(combo.toFixed(2))
    },
    paquetes: {
      mini: { lunes: parseFloat(miniLunes.toFixed(2)), viernes: parseFloat(miniViernes.toFixed(2)) },
      mediano: { lunes: parseFloat(medianoLunes.toFixed(2)), viernes: parseFloat(medianoViernes.toFixed(2)) },
      full: { lunes: parseFloat(fullLunes.toFixed(2)), viernes: parseFloat(fullViernes.toFixed(2)) }
    }
  };

  try {
    await guardarConfiguracionEnBackend(config);
    preciosOriginalesUSD = null;
    window.dispatchEvent(new CustomEvent('configUpdated', { detail: config }));
    if (typeof window.inicializarPreciosDinamicos === 'function') window.inicializarPreciosDinamicos();

    if (typeof Swal !== 'undefined') {
      Swal.fire({ title: "¡Configuración Guardada!", text: "Los precios se han actualizado.", icon: "success", confirmButtonColor: "#7C3AED" });
    }
  } catch (error) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({ title: "Error", text: "No se pudo guardar: " + error.message, icon: "error", confirmButtonColor: "#EF4444" });
    }
  }
}

async function restaurarConfiguracionDefault() {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: "¿Restaurar valores por defecto?", text: "Se perderán todos los cambios",
      icon: "warning", showCancelButton: true, confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#6B7280", confirmButtonText: "Sí, restaurar", cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await guardarConfiguracionEnBackend(PRECIOS_DEFAULT);
          await inicializarConfiguracion();
          Swal.fire({ title: "Restaurado", icon: "success", confirmButtonColor: "#7C3AED" });
        } catch (error) {
          Swal.fire({ title: "Error", text: "No se pudo restaurar", icon: "error" });
        }
      }
    });
  }
}

function actualizarContadorNotificaciones() {
  if (typeof reservas === 'undefined') return;
  const pendientes = reservas.filter(r => r.estadoReserva === "pendiente").length;
  const badge = document.getElementById("notification-count");
  if (badge) {
    badge.textContent = pendientes;
    badge.style.display = pendientes > 0 ? "block" : "none";
  }
}

function mostrarNotificaciones() {
  const panel = document.getElementById("notifications-panel");
  const lista = document.getElementById("notifications-list");
  if (!panel || !lista) return;

  panel.classList.toggle("hidden");

  if (!panel.classList.contains("hidden")) {
    if (typeof reservas === 'undefined') {
      lista.innerHTML = `<div class="notification-item"><div class="notification-title">Cargando...</div></div>`;
      return;
    }

    const pendientes = reservas.filter(r => r.estadoReserva === "pendiente");
    if (pendientes.length === 0) {
      lista.innerHTML = `<div class="notification-item"><div class="notification-title">No hay notificaciones</div></div>`;
    } else {
      lista.innerHTML = pendientes.map(r => `
        <div class="notification-item unread" data-id="${r._id}">
          <div class="notification-title">Nueva reserva pendiente</div>
          <div class="notification-message">${r.nombreCompleto} - ${r.parque} - ${r.fechaServicio}</div>
        </div>
      `).join("");

      lista.querySelectorAll(".notification-item").forEach(item => {
        item.addEventListener("click", () => {
          panel.classList.add("hidden");
          if (typeof cambiarSeccion === 'function') cambiarSeccion("reservas");
        });
      });
    }
  }
}

let parqueChart = null;

function renderizarGraficaParques() {
  const canvas = document.getElementById("parque-dona-chart");
  if (!canvas || typeof Chart === 'undefined') return;
  if (typeof reservas === 'undefined' || reservas.length === 0) return;

  const ctx = canvas.getContext("2d");
  if (parqueChart) parqueChart.destroy();

  const conteoParques = { "Maracaibo": 0, "Caracas": 0, "Punto Fijo": 0 };
  reservas.forEach(r => { if (conteoParques.hasOwnProperty(r.parque)) conteoParques[r.parque]++; });

  parqueChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Maracaibo", "Caracas", "Punto Fijo"],
      datasets: [{
        data: [conteoParques["Maracaibo"], conteoParques["Caracas"], conteoParques["Punto Fijo"]],
        backgroundColor: ["rgba(124, 58, 237, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)"],
        borderColor: ["rgba(124, 58, 237, 1)", "rgba(16, 185, 129, 1)", "rgba(245, 158, 11, 1)"],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { family: "Outfit", size: 14 }, padding: 15 } },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

let preciosOriginalesUSD = null;
let monedaActual = "USD";

function guardarPreciosOriginales() {
  if (preciosOriginalesUSD) return;
  preciosOriginalesUSD = {
    tickets: {
      min15: parseFloat(document.getElementById("ticket-15min")?.value) || 6,
      min30: parseFloat(document.getElementById("ticket-30min")?.value) || 9,
      min60: parseFloat(document.getElementById("ticket-60min")?.value) || 10,
      fullday: parseFloat(document.getElementById("ticket-fullday")?.value) || 11,
      combo: parseFloat(document.getElementById("ticket-combo")?.value) || 13
    },
    paquetes: {
      mini: { lunes: parseFloat(document.getElementById("mini-lunes")?.value) || 150, viernes: parseFloat(document.getElementById("mini-viernes")?.value) || 180 },
      mediano: { lunes: parseFloat(document.getElementById("mediano-lunes")?.value) || 200, viernes: parseFloat(document.getElementById("mediano-viernes")?.value) || 230 },
      full: { lunes: parseFloat(document.getElementById("full-lunes")?.value) || 250, viernes: parseFloat(document.getElementById("full-viernes")?.value) || 280 }
    }
  };
}

function convertirPrecios(moneda) {
  const tasaBCV = parseFloat(document.getElementById("tasa-bcv")?.value) || 244.65;
  if (!preciosOriginalesUSD) guardarPreciosOriginales();

  const ticketIds = ["ticket-15min", "ticket-30min", "ticket-60min", "ticket-fullday", "ticket-combo"];
  const ticketKeys = ["min15", "min30", "min60", "fullday", "combo"];
  const paqueteIds = ["mini-lunes", "mini-viernes", "mediano-lunes", "mediano-viernes", "full-lunes", "full-viernes"];

  if (moneda === "BS") {
    ticketIds.forEach((id, i) => {
      document.getElementById(id).value = (preciosOriginalesUSD.tickets[ticketKeys[i]] * tasaBCV).toFixed(2);
    });
    document.getElementById("mini-lunes").value = (preciosOriginalesUSD.paquetes.mini.lunes * tasaBCV).toFixed(2);
    document.getElementById("mini-viernes").value = (preciosOriginalesUSD.paquetes.mini.viernes * tasaBCV).toFixed(2);
    document.getElementById("mediano-lunes").value = (preciosOriginalesUSD.paquetes.mediano.lunes * tasaBCV).toFixed(2);
    document.getElementById("mediano-viernes").value = (preciosOriginalesUSD.paquetes.mediano.viernes * tasaBCV).toFixed(2);
    document.getElementById("full-lunes").value = (preciosOriginalesUSD.paquetes.full.lunes * tasaBCV).toFixed(2);
    document.getElementById("full-viernes").value = (preciosOriginalesUSD.paquetes.full.viernes * tasaBCV).toFixed(2);
  } else {
    ticketIds.forEach((id, i) => {
      document.getElementById(id).value = preciosOriginalesUSD.tickets[ticketKeys[i]];
    });
    document.getElementById("mini-lunes").value = preciosOriginalesUSD.paquetes.mini.lunes;
    document.getElementById("mini-viernes").value = preciosOriginalesUSD.paquetes.mini.viernes;
    document.getElementById("mediano-lunes").value = preciosOriginalesUSD.paquetes.mediano.lunes;
    document.getElementById("mediano-viernes").value = preciosOriginalesUSD.paquetes.mediano.viernes;
    document.getElementById("full-lunes").value = preciosOriginalesUSD.paquetes.full.lunes;
    document.getElementById("full-viernes").value = preciosOriginalesUSD.paquetes.full.viernes;
  }
  monedaActual = moneda;
}

document.addEventListener("DOMContentLoaded", () => {
  const guardarBtn = document.getElementById("guardar-config-btn");
  const resetBtn = document.getElementById("reset-config-btn");
  const monedaSelect = document.getElementById("moneda-select");
  const tasaBcvInput = document.getElementById("tasa-bcv");
  const closeNotifBtn = document.getElementById("close-notifications");

  if (guardarBtn) guardarBtn.addEventListener("click", guardarConfiguracionDesdeFormulario);
  if (resetBtn) resetBtn.addEventListener("click", restaurarConfiguracionDefault);
  if (monedaSelect) monedaSelect.addEventListener("change", (e) => convertirPrecios(e.target.value));
  if (tasaBcvInput) tasaBcvInput.addEventListener("change", () => { if (monedaActual === "BS") convertirPrecios("BS"); });
  if (closeNotifBtn) closeNotifBtn.addEventListener("click", () => document.getElementById("notifications-panel")?.classList.add("hidden"));

  const configNav = document.querySelector('.nav-item[data-section="configuracion"]');
  if (configNav) {
    configNav.addEventListener("click", () => {
      setTimeout(() => { inicializarConfiguracion(); setTimeout(guardarPreciosOriginales, 200); }, 100);
    });
  }

  setInterval(() => { if (typeof reservas !== 'undefined') actualizarContadorNotificaciones(); }, 30000);
});
