// admin.js - Panel administrativo BRINCAPARK (VERSIÓN COMPLETA FINAL)

// 1. URL DINÁMICA
const API = window.API_BASE_URL || "http://localhost:4000/api";
console.log("Admin conectando a:", API);

// 2. ESTADO GLOBAL (Con Token JWT)
let authToken = sessionStorage.getItem("adminToken") || "";
let reservas = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// 3. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  console.log("Panel Admin cargado");

  // Verificar autenticación
  if (authToken) {
    mostrarDashboard();
    cargarReservas();
  } else {
    mostrarLogin();
  }

  // --- LÓGICA DEL MENÚ MÓVIL ---
  const sidebar = document.querySelector('.sidebar');
  const openBtn = document.getElementById('open-sidebar');
  const closeBtn = document.getElementById('close-sidebar');

  if (openBtn) openBtn.addEventListener('click', () => sidebar.classList.add('active'));
  if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));

  // Eventos de botones principales
  document.getElementById("login-form")?.addEventListener("submit", handleLogin);
  document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

  document.getElementById("refresh-btn")?.addEventListener("click", () => {
    // Animación de refresco
    const icon = document.querySelector("#refresh-btn svg");
    if (icon) {
      icon.style.transition = "transform 0.5s ease";
      icon.style.transform = "rotate(360deg)";
      setTimeout(() => icon.style.transform = "none", 500);
    }
    console.log("Actualizando datos...");
    cargarReservas();
  });

  document.getElementById("notifications-btn")?.addEventListener("click", mostrarNotificaciones);
  document.getElementById("export-pdf-btn")?.addEventListener("click", exportarPDF);
  document.getElementById("export-excel-btn")?.addEventListener("click", exportarExcel);

  // Navegación entre secciones
  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      cambiarSeccion(section);

      // Cierre automático del menú en móvil
      if (window.innerWidth <= 1024 && sidebar) {
        sidebar.classList.remove('active');
      }
    });
  });
});

/**
 * Cambiar Sección
 */
function cambiarSeccion(seccion) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  document.querySelector(`.nav-item[data-section="${seccion}"]`)?.classList.add("active");

  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.add("hidden");
  });
  document.getElementById(`section-${seccion}`)?.classList.remove("hidden");

  // Cargar gráficas avanzadas si es la sección de reportes
  if (seccion === "reportes") {
    setTimeout(() => {
      if (typeof renderAdvancedMetrics === 'function') renderAdvancedMetrics();
      if (typeof renderizarTopClientes === 'function') renderizarTopClientes();
      if (typeof renderizarAnalisisCancelaciones === 'function') renderizarAnalisisCancelaciones();
      if (typeof renderizarGraficaMensual === 'function') renderizarGraficaMensual();
      if (typeof renderizarComparativaParques === 'function') renderizarComparativaParques();
    }, 100);
  }
}

/**
 * LOGIN (Con JWT)
 */
async function handleLogin(e) {
  e.preventDefault();
  const secretInput = document.getElementById("admin-secret");
  const secret = secretInput.value.trim();

  if (!secret) {
    return Swal.fire({ text: "Ingresa el código", icon: "error", confirmButtonColor: "#7C3AED" });
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Verificando...";

  try {
    // Solicitud de Token
    const response = await fetch(`${API}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      authToken = data.token;
      sessionStorage.setItem("adminToken", authToken); // Guardamos Token

      mostrarDashboard();
      cargarReservas();

      Swal.fire({
        text: "¡Acceso concedido!",
        icon: "success",
        confirmButtonColor: "#7C3AED",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({ text: "Código incorrecto", icon: "error", confirmButtonColor: "#7C3AED" });
    }
  } catch (error) {
    console.error("Error login:", error);
    Swal.fire({ text: "Error de conexión", icon: "error", confirmButtonColor: "#7C3AED" });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Acceder";
  }
}

function handleLogout(e) {
  if (e) e.preventDefault();
  authToken = "";
  sessionStorage.removeItem("adminToken");
  reservas = [];
  mostrarLogin();
}

function mostrarLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard-screen").classList.add("hidden");
}

function mostrarDashboard() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard-screen").classList.remove("hidden");
}

/**
 * CARGAR RESERVAS (Con Token)
 */
async function cargarReservas() {
  try {
    console.log("Cargando reservas...");
    const response = await fetch(`${API}/admin/reservas`, {
      headers: { "Authorization": `Bearer ${authToken}` }, // Header JWT
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        handleLogout(); // Token expirado
        return;
      }
      renderizarTodo();
      return;
    }

    const data = await response.json();
    reservas = Array.isArray(data) ? data : [];
    console.log(`${reservas.length} reservas cargadas`);
    renderizarTodo();
  } catch (err) {
    console.error("Error cargando reservas:", err);
    renderizarTodo();
  }
}

async function renderizarTodo() {
  try { await renderStats(); } catch (e) { }
  try { renderTable(); } catch (e) { }
  try { renderGraph(); } catch (e) { }
  try { renderCalendar(); } catch (e) { }
  try { updateNotifications(); } catch (e) { }

  // Métricas adicionales de analytics
  if (typeof renderizarMetricasAdicionales === 'function') renderizarMetricasAdicionales();

  // Gráficas de analytics del dashboard
  if (typeof renderizarGraficaIngresosMensuales === 'function') renderizarGraficaIngresosMensuales();
  if (typeof renderizarGraficaTipoEvento === 'function') renderizarGraficaTipoEvento();
  if (typeof renderizarGraficaParques === 'function') renderizarGraficaParques();
}

/**
 * ESTADÍSTICAS
 */
async function renderStats() {
  const total = reservas.length;
  let maracaibo = 0, caracas = 0, puntofijo = 0;

  reservas.forEach((r) => {
    if (r.parque === "Maracaibo") maracaibo++;
    if (r.parque === "Caracas") caracas++;
    if (r.parque === "Punto Fijo") puntofijo++;
  });

  let dinero = 0;
  let moneda = "$";
  try {
    const res = await fetch(`${API}/reservations/analytics/stats`, {
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    if (res.ok) {
      const stats = await res.json();
      dinero = stats.ingresoTotal || 0;
      moneda = stats.moneda === "BS" ? "Bs" : "$";
    }
  } catch (err) { console.error(err); }

  document.getElementById("total-reservas").textContent = total;
  document.getElementById("total-dinero").textContent = `${moneda}${dinero.toFixed(2)}`;
  document.getElementById("total-maracaibo").textContent = maracaibo;
  document.getElementById("total-caracas").textContent = caracas;
  document.getElementById("total-puntofijo").textContent = puntofijo;
}

/**
 * TABLA DE RESERVAS
 */
function renderTable() {
  const tbody = document.querySelector("#tabla-reservas tbody");
  if (!tbody) return;

  const searchTerm = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
  const filtroParque = document.getElementById("filtro-parque")?.value || "";
  const filtroEstado = document.getElementById("filtro-estado")?.value || "";
  const filtroFechaDesde = document.getElementById("filtro-fecha-desde")?.value || "";
  const filtroFechaHasta = document.getElementById("filtro-fecha-hasta")?.value || "";

  const filtradas = reservas.filter((r) => {
    if (searchTerm) {
      const texto = (r.nombreCompleto + r.telefono + r.correo).toLowerCase();
      if (!texto.includes(searchTerm)) return false;
    }
    if (filtroParque && r.parque !== filtroParque) return false;
    if (filtroEstado && r.estadoReserva !== filtroEstado) return false;
    if (filtroFechaDesde && r.fechaServicio < filtroFechaDesde) return false;
    if (filtroFechaHasta && r.fechaServicio > filtroFechaHasta) return false;
    return true;
  });

  updateResultsCounter(filtradas.length, reservas.length);

  if (filtradas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #6B7280;">No hay resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = filtradas.map(r => `
    <tr>
      <td><div style="font-weight: 600;">${r.nombreCompleto}</div></td>
      <td>
        <div style="font-size: 0.85rem;">${r.correo}</div>
        <div style="font-size: 0.85rem; color: #666;">${r.telefono}</div>
      </td>
      <td>${r.fechaServicio}</td>
      <td>${r.horaReservacion}</td>
      <td><span style="font-weight: 600; color: #7C3AED;">${r.parque}</span></td>
      <td>${r.paquete}</td>
      <td>${r.tipoEvento}</td>
      <td>
        <select data-id="${r._id}" class="estado-select" style="${r.estadoReserva === 'aprobado' ? 'background:#D1FAE5; color:#065F46;' :
      r.estadoReserva === 'cancelado' ? 'background:#FEE2E2; color:#991B1B;' :
        'background:#FEF3C7; color:#92400E;'
    }">
          <option value="pendiente" ${r.estadoReserva === 'pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="aprobado" ${r.estadoReserva === 'aprobado' ? 'selected' : ''}>Aprobado</option>
          <option value="cancelado" ${r.estadoReserva === 'cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="editarReserva('${r._id}')">Editar</button>
          <button class="btn-delete" onclick="eliminarReservaUI('${r._id}')">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');

  attachTableEventListeners();
}

function updateResultsCounter(filtered, total) {
  const rc = document.getElementById("results-count");
  const tc = document.getElementById("total-count");
  if (rc) rc.textContent = filtered;
  if (tc) tc.textContent = total;
}

function clearAllFilters() {
  const inputs = ["search-input", "filtro-parque", "filtro-estado", "filtro-fecha-desde", "filtro-fecha-hasta"];
  inputs.forEach(id => { if (document.getElementById(id)) document.getElementById(id).value = ""; });
  renderTable();
}



function attachTableEventListeners() {
  document.querySelectorAll(".estado-select").forEach((sel) => {
    sel.addEventListener("change", async (e) => {
      const id = sel.dataset.id;
      const estado = sel.value;
      sel.disabled = true;

      try {
        const res = await fetch(`${API}/admin/reservas/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ estado: estado }),  // Usar "estado" no "estadoReserva"
        });

        if (res.ok) {
          cargarReservas();
          const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
          Toast.fire({ icon: 'success', title: 'Estado actualizado' });
        } else { throw new Error(); }
      } catch (err) {
        console.error("Error:", err);
        sel.disabled = false;
        sel.value = reservas.find(r => r._id === id).estadoReserva;
        Swal.fire({ text: "Error actualizando estado", icon: "error", confirmButtonColor: "#7C3AED" });
      }
    });
  });

  // Re-conectar filtro de búsqueda
  const searchInput = document.getElementById("search-input");
  if (searchInput && !searchInput.dataset.attached) {
    searchInput.addEventListener("input", renderTable);
    searchInput.dataset.attached = "true";
    document.getElementById("filtro-parque")?.addEventListener("change", renderTable);
    document.getElementById("filtro-estado")?.addEventListener("change", renderTable);
    document.getElementById("filtro-fecha-desde")?.addEventListener("change", renderTable);
    document.getElementById("filtro-fecha-hasta")?.addEventListener("change", renderTable);
    document.getElementById("clear-filters-btn")?.addEventListener("click", clearAllFilters);
  }
}

/**
 * ELIMINAR RESERVA (Global para onclick)
 */
window.eliminarReservaUI = async (id) => {
  const result = await Swal.fire({
    title: "¿Eliminar?", text: "No se puede deshacer", icon: "warning",
    showCancelButton: true, confirmButtonColor: "#EF4444", confirmButtonText: "Sí, eliminar"
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API}/admin/reservas/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        Swal.fire({ text: "Eliminado", icon: "success", confirmButtonColor: "#7C3AED", timer: 1500, showConfirmButton: false });
        cargarReservas();
      }
    } catch (err) { console.error(err); }
  }
};

/**
 * EDITAR RESERVA (Formulario Completo)
 */
window.editarReserva = async (id) => {
  const r = reservas.find(item => item._id === id);
  if (!r) return;

  const { value: formValues } = await Swal.fire({
    title: "Editar Reserva",
    html: `
      <div style="text-align: left; padding: 1rem; max-height: 500px; overflow-y: auto;">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600;">Nombre:</label>
          <input id="edit-nombre" class="swal2-input" style="width: 90%; margin: 0;" value="${r.nombreCompleto}">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600;">Correo:</label>
          <input id="edit-correo" class="swal2-input" style="width: 90%; margin: 0;" value="${r.correo}">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600;">Teléfono:</label>
          <input id="edit-telefono" class="swal2-input" style="width: 90%; margin: 0;" value="${r.telefono}">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600;">Fecha:</label>
          <input id="edit-fecha" type="date" class="swal2-input" style="width: 90%; margin: 0;" value="${r.fechaServicio}">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600;">Hora:</label>
          <select id="edit-hora" class="swal2-input" style="width: 90%; margin: 0;">
            <option value="10am-1pm" ${r.horaReservacion === "10am-1pm" ? "selected" : ""}>10am - 1pm</option>
            <option value="2pm-5pm" ${r.horaReservacion === "2pm-5pm" ? "selected" : ""}>2pm - 5pm</option>
            <option value="6pm-9pm" ${r.horaReservacion === "6pm-9pm" ? "selected" : ""}>6pm - 9pm</option>
          </select>
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600;">Parque:</label>
          <select id="edit-parque" class="swal2-input" style="width: 90%; margin: 0;">
            <option value="Maracaibo" ${r.parque === "Maracaibo" ? "selected" : ""}>Maracaibo</option>
            <option value="Caracas" ${r.parque === "Caracas" ? "selected" : ""}>Caracas</option>
            <option value="Punto Fijo" ${r.parque === "Punto Fijo" ? "selected" : ""}>Punto Fijo</option>
          </select>
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600;">Paquete:</label>
          <select id="edit-paquete" class="swal2-input" style="width: 90%; margin: 0;">
            <option value="mini" ${r.paquete === "mini" ? "selected" : ""}>Mini</option>
            <option value="mediano" ${r.paquete === "mediano" ? "selected" : ""}>Mediano</option>
            <option value="full" ${r.paquete === "full" ? "selected" : ""}>Full</option>
          </select>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    confirmButtonColor: "#7C3AED",
    width: 600,
    preConfirm: () => {
      return {
        nombreCompleto: document.getElementById("edit-nombre").value,
        correo: document.getElementById("edit-correo").value,
        telefono: document.getElementById("edit-telefono").value,
        fechaServicio: document.getElementById("edit-fecha").value,
        horaReservacion: document.getElementById("edit-hora").value,
        parque: document.getElementById("edit-parque").value,
        paquete: document.getElementById("edit-paquete").value,
        // Mantener datos que no están en el form
        tipoEvento: r.tipoEvento,
        estadoUbicacion: r.estadoUbicacion
      };
    },
  });

  if (formValues) {
    try {
      const res = await fetch(`${API}/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`  // Token JWT incluido
        },
        body: JSON.stringify(formValues),
      });

      if (res.ok) {
        Swal.fire({ text: "Reserva actualizada", icon: "success", confirmButtonColor: "#7C3AED", timer: 1500, showConfirmButton: false });
        cargarReservas();
      }
    } catch (err) { console.error(err); }
  }
};

/**
 * GRÁFICAS Y UTILIDADES VISUALES (Tus 400 líneas restantes integradas)
 */
function renderGraph() {
  if (window.reservasChart && typeof window.reservasChart.destroy === "function") {
    window.reservasChart.destroy();
  }
  const canvas = document.getElementById("reservasChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  window.reservasChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Maracaibo", "Caracas", "Punto Fijo"],
      datasets: [{
        label: "Reservas",
        data: [
          reservas.filter((r) => r.parque === "Maracaibo").length,
          reservas.filter((r) => r.parque === "Caracas").length,
          reservas.filter((r) => r.parque === "Punto Fijo").length,
        ],
        backgroundColor: ["#7C3AED", "#A78BFA", "#C4B5FD"],
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

function renderCalendar() {
  const calendarWidget = document.getElementById("calendar-widget");
  if (!calendarWidget) return;

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const prevLastDay = new Date(currentYear, currentMonth, 0);
  const firstDayIndex = firstDay.getDay();
  const lastDayDate = lastDay.getDate();
  const prevLastDayDate = prevLastDay.getDate();  // Obtener el número del último día del mes anterior
  const nextDays = 7 - lastDay.getDay() - 1;

  let html = `
    <div class="calendar-header">
      <div class="calendar-month">${monthNames[currentMonth]} ${currentYear}</div>
      <div class="calendar-nav">
        <button onclick="changeMonth(-1)">‹</button>
        <button onclick="changeMonth(1)">›</button>
      </div>
    </div>
    <div class="calendar-grid">
  `;
  dayNames.forEach(day => html += `<div class="calendar-day-header">${day}</div>`);

  for (let x = firstDayIndex; x > 0; x--) {
    html += `<div class="calendar-day other-month">${prevLastDayDate - x + 1}</div>`;
  }

  const today = new Date();
  for (let i = 1; i <= lastDayDate; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const hasReservation = reservas.some(r => r.fechaServicio === dateStr);
    const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
    let classes = "calendar-day";
    if (hasReservation) classes += " has-reservation";
    if (isToday) classes += " today";
    html += `<div class="${classes}" onclick="showDayReservations('${dateStr}')">${i}</div>`;
  }

  for (let j = 1; j <= nextDays; j++) {
    html += `<div class="calendar-day other-month">${j}</div>`;
  }
  html += "</div>";
  calendarWidget.innerHTML = html;
}

function changeMonth(direction) {
  currentMonth += direction;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
}

function showDayReservations(dateStr) {
  const dayReservations = reservas.filter(r => r.fechaServicio === dateStr);
  if (dayReservations.length === 0) {
    Swal.fire({ title: dateStr, text: "No hay reservas", icon: "info", confirmButtonColor: "#7C3AED" });
    return;
  }
  const html = dayReservations.map(r => `
    <div style="text-align: left; padding: 1rem; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 0.5rem;">
      <strong>${r.nombreCompleto}</strong><br>
      <small>${r.parque} - ${r.horaReservacion}</small>
    </div>`).join("");
  Swal.fire({ title: `Reservas ${dateStr}`, html: html, confirmButtonColor: "#7C3AED" });
}

function updateNotifications() {
  const pendientes = reservas.filter(r => r.estadoReserva === "pendiente").length;
  const badge = document.getElementById("notification-count");
  if (badge) {
    badge.textContent = pendientes;
    badge.style.display = pendientes > 0 ? "block" : "none";
  }
}

function mostrarNotificaciones() {
  const pendientes = reservas.filter(r => r.estadoReserva === "pendiente");
  if (pendientes.length === 0) return Swal.fire({ title: "Sin notificaciones", icon: "info", confirmButtonColor: "#7C3AED" });

  const html = pendientes.map(r => `
    <div style="text-align: left; padding: 1rem; border: 1px solid #FEF3C7; background: #FFFBEB; margin-bottom: 0.5rem;">
      <strong>${r.nombreCompleto}</strong><br><small>${r.fechaServicio}</small>
    </div>`).join("");
  Swal.fire({ title: "Pendientes", html: html, confirmButtonColor: "#7C3AED" });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("BRINCAPARK - Reporte", 14, 20);
  const data = reservas.map(r => [r.nombreCompleto, r.parque, r.fechaServicio, r.horaReservacion, r.estadoReserva]);
  doc.autoTable({ head: [["Cliente", "Parque", "Fecha", "Hora", "Estado"]], body: data, startY: 30 });
  doc.save(`Reporte_${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportarExcel() {
  const ws = XLSX.utils.json_to_sheet(reservas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reservas");
  XLSX.writeFile(wb, "Reporte_Brincapark.xlsx");
}

// Exponer funciones globales
window.changeMonth = changeMonth;
window.showDayReservations = showDayReservations;
window.editarReserva = editarReserva;
window.eliminarReservaUI = eliminarReservaUI;
window.mostrarNotificaciones = mostrarNotificaciones;
window.exportarPDF = exportarPDF;
window.exportarExcel = exportarExcel;