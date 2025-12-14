// admin-analytics.js - Módulo de analytics y métricas avanzadas

// CORRECCIÓN: Usamos un nombre único para evitar choque con admin.js
const API_STATS = window.API_BASE_URL || "http://localhost:4000/api";

// Variables globales para charts
let ingresosMensualesChart = null;
let tipoEventoChart = null;

// MÉTRICAS ADICIONALES PARA DASHBOARD
async function renderizarMetricasAdicionales() {
  try {
    // Usamos API_STATS aquí
    const res = await fetch(`${API_STATS}/reservations/analytics/stats`, {
      headers: { "x-admin-secret": sessionStorage.getItem("adminSecret") }
    });
    
    if (!res.ok) return;
    const stats = await res.json();
    
    let container = document.getElementById("metricas-adicionales");
    if (!container) {
      const statsGrid = document.querySelector(".stats-grid");
      if (statsGrid) {
        container = document.createElement("div");
        container.id = "metricas-adicionales";
        container.className = "stats-grid";
        container.style.marginTop = "2rem";
        statsGrid.parentNode.insertBefore(container, statsGrid.nextSibling);
      }
    }

    if (!container) return;

    container.innerHTML = `
      <div class="stat-card stat-conversion">
        <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
        <div class="stat-content"><p class="stat-label">Tasa de Conversión</p><h3 class="stat-value">${stats.tasaConversion}%</h3><p class="stat-sublabel">Pendientes → Aprobados</p></div>
      </div>
      <div class="stat-card stat-average">
        <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
        <div class="stat-content"><p class="stat-label">Ingreso Promedio</p><h3 class="stat-value">${formatearMoneda(stats.ingresoPromedio, stats.moneda)}</h3><p class="stat-sublabel">Por reserva aprobada</p></div>
      </div>
      <div class="stat-card stat-day">
        <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
        <div class="stat-content"><p class="stat-label">Día Más Popular</p><h3 class="stat-value">${stats.diaMasPopular}</h3><p class="stat-sublabel">Mayor demanda</p></div>
      </div>
      <div class="stat-card stat-package">
        <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
        <div class="stat-content"><p class="stat-label">Paquete Más Vendido</p><h3 class="stat-value">${capitalizar(stats.paqueteMasVendido)}</h3><p class="stat-sublabel">Mayor preferencia</p></div>
      </div>
    `;
  } catch (error) {
    console.error("Error renderizando métricas adicionales:", error);
  }
}

// Graficas de ingresos mensuales
async function renderizarGraficaIngresosMensuales() {
  try {
    // Usamos API_STATS
    const res = await fetch(`${API_STATS}/reservations/analytics/monthly`, {
        headers: { "x-admin-secret": sessionStorage.getItem("adminSecret") }
    });
    
    if (!res.ok) return;
    const data = await res.json();

    const canvas = document.getElementById("ingresos-mensuales-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ingresosMensualesChart) ingresosMensualesChart.destroy();

    ingresosMensualesChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.meses,
        datasets: [{
          label: `Ingresos (${data.moneda})`,
          data: data.ingresos,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "top" },
          title: { display: true, text: "Ingresos por Mes (Últimos 6 Meses)" },
          tooltip: {
            callbacks: {
              label: function (context) { return `${context.dataset.label}: ${formatearMoneda(context.parsed.y, data.moneda)}`; },
            },
          },
        },
        scales: { y: { beginAtZero: true, ticks: { callback: function (value) { return formatearMoneda(value, data.moneda); } } } },
      },
    });
  } catch (error) {
    console.error("Error renderizando gráfica de ingresos mensuales:", error);
  }
}

// Grafica de tipo de evento
async function renderizarGraficaTipoEvento() {
  try {
    // Usamos API_STATS
    const res = await fetch(`${API_STATS}/reservations/analytics/stats`, {
        headers: { "x-admin-secret": sessionStorage.getItem("adminSecret") }
    });
    
    if (!res.ok) return;
    const stats = await res.json();

    const canvas = document.getElementById("tipo-evento-chart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (tipoEventoChart) tipoEventoChart.destroy();

    const labels = Object.keys(stats.porTipoEvento);
    const valores = Object.values(stats.porTipoEvento);

    tipoEventoChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.map(capitalizar),
        datasets: [{
          label: "Reservas por Tipo de Evento",
          data: valores,
          backgroundColor: ["rgba(255, 99, 132, 0.7)", "rgba(54, 162, 235, 0.7)", "rgba(255, 206, 86, 0.7)", "rgba(75, 192, 192, 0.7)", "rgba(153, 102, 255, 0.7)"],
          borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: "Distribución por Tipo de Evento" } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  } catch (error) {
    console.error("Error renderizando gráfica de tipo de evento:", error);
  }
}

// Reportes avanzados
async function renderizarTopClientes() {
  try {
    // Usamos API_STATS
    const res = await fetch(`${API_STATS}/reservations/analytics/top-clients`, {
        headers: { "x-admin-secret": sessionStorage.getItem("adminSecret") }
    });
    
    if (!res.ok) return;
    const clientes = await res.json();

    const container = document.getElementById("top-clientes-container");
    if (!container) return;

    if (clientes.length === 0) { container.innerHTML = "<p>No hay datos de clientes disponibles.</p>"; return; }

    let html = `<div class="top-clientes-list"><table class="top-clientes-table"><thead><tr><th>#</th><th>Cliente</th><th>Email</th><th>Total Reservas</th><th>Aprobadas</th><th>Canceladas</th></tr></thead><tbody>`;
    clientes.forEach((cliente, index) => {
      html += `<tr><td>${index + 1}</td><td>${cliente.nombre}</td><td>${cliente.correo}</td><td><strong>${cliente.totalReservas}</strong></td><td class="text-success">${cliente.aprobadas}</td><td class="text-danger">${cliente.canceladas}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
  } catch (error) {
    console.error("Error renderizando top clientes:", error);
  }
}

async function renderizarAnalisisCancelaciones() {
  try {
    // Usamos API_STATS
    const res = await fetch(`${API_STATS}/reservations/analytics/cancellations`, {
        headers: { "x-admin-secret": sessionStorage.getItem("adminSecret") }
    });
    
    if (!res.ok) return;
    const analisis = await res.json();

    const container = document.getElementById("analisis-cancelaciones-container");
    if (!container) return;

    if (analisis.total === 0) { container.innerHTML = "<p>No hay cancelaciones para analizar.</p>"; return; }

    let html = `
      <div class="cancelaciones-summary"><h4>Total de Cancelaciones: ${analisis.total}</h4></div>
      <div class="cancelaciones-grid">
        <div class="cancelaciones-card"><h5>Por Parque</h5><ul>${Object.entries(analisis.porParque).map(([parque, count]) => `<li>${parque}: <strong>${count}</strong></li>`).join("")}</ul></div>
        <div class="cancelaciones-card"><h5>Por Paquete</h5><ul>${Object.entries(analisis.porPaquete).map(([paquete, count]) => `<li>${capitalizar(paquete)}: <strong>${count}</strong></li>`).join("")}</ul></div>
        <div class="cancelaciones-card"><h5>Por Tipo de Evento</h5><ul>${Object.entries(analisis.porTipoEvento).map(([tipo, count]) => `<li>${capitalizar(tipo)}: <strong>${count}</strong></li>`).join("")}</ul></div>
      </div>
    `;
    container.innerHTML = html;
  } catch (error) {
    console.error("Error renderizando análisis de cancelaciones:", error);
  }
}

// Utilidades
function capitalizar(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatearMoneda(valor, moneda) {
  const valorFormateado = parseFloat(valor).toFixed(2);
  if (moneda === "USD") return `$${valorFormateado}`;
  else if (moneda === "BS") return `Bs ${valorFormateado}`;
  return `$${valorFormateado}`;
}

// Exportar funciones
window.renderizarMetricasAdicionales = renderizarMetricasAdicionales;
window.renderizarGraficaIngresosMensuales = renderizarGraficaIngresosMensuales;
window.renderizarGraficaTipoEvento = renderizarGraficaTipoEvento;
window.renderizarTopClientes = renderizarTopClientes;
window.renderizarAnalisisCancelaciones = renderizarAnalisisCancelaciones;