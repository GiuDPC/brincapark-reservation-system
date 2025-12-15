// admin.js - Panel administrativo BRINCAPARK

// 1. URL DINÁMICA (Corrección para que funcione en la nube)
const API = window.API_BASE_URL || "http://localhost:4000/api";
console.log("Admin conectando a:", API);

// Estado global
let adminSecret = sessionStorage.getItem("adminSecret") || "";
let reservas = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Panel Admin cargado");

  // Verificar si ya está autenticado
  if (adminSecret) {
    mostrarDashboard();
    cargarReservas();
  } else {
    mostrarLogin();
  }

  // --- LÓGICA DEL MENÚ MÓVIL (NUEVO) ---
  const sidebar = document.querySelector('.sidebar');
  const openBtn = document.getElementById('open-sidebar');
  const closeBtn = document.getElementById('close-sidebar');

  if (openBtn) openBtn.addEventListener('click', () => sidebar.classList.add('active'));
  if (closeBtn) closeBtn.addEventListener('click', () => sidebar.classList.remove('active'));

  // Eventos de botones
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

  // Navegación entre secciones de dashboard
  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      cambiarSeccion(section);

      // Cierre automático del menú en móvil al navegar
      if (window.innerWidth <= 1024 && sidebar) {
        sidebar.classList.remove('active');
      }
    });
  });
});

/**
  //Cambiar entre secciones del dashboard
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

  if (seccion === "reportes") {
    setTimeout(() => {
      // Verificar que las funciones existan antes de ejecutarlas
      if (typeof renderAdvancedMetrics === 'function') renderAdvancedMetrics();
      if (typeof renderizarTopClientes === 'function') renderizarTopClientes();
      if (typeof renderizarAnalisisCancelaciones === 'function') renderizarAnalisisCancelaciones();
      // Gráficas de la sección Métricas Avanzadas
      if (typeof renderizarGraficaMensual === 'function') renderizarGraficaMensual();
      if (typeof renderizarComparativaParques === 'function') renderizarComparativaParques();
    }, 100);
  }
}

/**
 * Manejar el login para acceder al panel administrativo
 */
async function handleLogin(e) {
  e.preventDefault();

  const secretInput = document.getElementById("admin-secret");
  const secret = secretInput.value.trim();

  if (!secret) {
    Swal.fire({
      text: "Por favor ingresa el código de acceso",
      icon: "error",
      confirmButtonColor: "#7C3AED",
    });
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const textoOriginal = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Verificando...";

  try {
    // CORRECCIÓN: Usar API
    const response = await fetch(`${API}/admin/reservas`, {
      headers: { "x-admin-secret": secret },
    });

    if (response.ok) {
      adminSecret = secret;
      sessionStorage.setItem("adminSecret", secret);

      const data = await response.json();
      reservas = Array.isArray(data) ? data : [];
      console.log(`${reservas.length} reservas cargadas en login`);

      mostrarDashboard();
      renderizarTodo();

      Swal.fire({
        text: "¡Acceso concedido!",
        icon: "success",
        confirmButtonColor: "#7C3AED",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        text: "Código de acceso incorrecto",
        icon: "error",
        confirmButtonColor: "#7C3AED",
      });
    }
  } catch (error) {
    console.error("Error en login:", error);
    Swal.fire({
      text: "Error de conexión con el backend",
      icon: "error",
      confirmButtonColor: "#7C3AED",
    });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = textoOriginal;
  }
}

/**
 * Cerrar sesión
 */
function handleLogout(e) {
  if (e) e.preventDefault();
  adminSecret = "";
  sessionStorage.removeItem("adminSecret");
  reservas = [];
  mostrarLogin();
}

/**
 * Mostrar pantalla de login
 */
function mostrarLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard-screen").classList.add("hidden");
}

/**
 * Mostrar dashboard
 */
function mostrarDashboard() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard-screen").classList.remove("hidden");
}

/**
 * Cargar reservas desde el backend y actualizar el dashboard
 */
async function cargarReservas() {
  try {
    console.log("Cargando reservas...");
    // CORRECCIÓN: Usar API
    const response = await fetch(`${API}/admin/reservas`, {
      headers: { "x-admin-secret": adminSecret },
    });

    if (!response.ok) {
      console.error(`Error HTTP: ${response.status}`);
      // Si el error es de autenticación, cerrar sesión
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      renderizarTodo();
      return;
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Respuesta no es un array:", data);
      renderizarTodo();
      return;
    }

    // Solo actualizar si tenemos datos válidos
    reservas = data;
    console.log(`${reservas.length} reservas cargadas correctamente`);

    renderizarTodo();
  } catch (err) {
    console.error("Error cargando reservas:", err);
    renderizarTodo();
  }
}

/**
 * Renderizar todo el dashboard
 */
async function renderizarTodo() {
  console.log("Renderizando dashboard con", reservas.length, "reservas");

  try { await renderStats(); } catch (e) { console.error("Error en renderStats:", e); }
  try { renderTable(); } catch (e) { console.error("Error en renderTable:", e); }
  try { renderGraph(); } catch (e) { console.error("Error en renderGraph:", e); }
  try { renderCalendar(); } catch (e) { console.error("Error en renderCalendar:", e); }
  try { updateNotifications(); } catch (e) { console.error("Error en updateNotifications:", e); }

  // Renderizar gráficas externas si existen
  if (typeof renderizarMetricasAdicionales === 'function') renderizarMetricasAdicionales();
  if (typeof renderizarGraficaIngresosMensuales === 'function') renderizarGraficaIngresosMensuales();
  if (typeof renderizarGraficaTipoEvento === 'function') renderizarGraficaTipoEvento();
  if (typeof renderizarGraficaParques === 'function') renderizarGraficaParques();
}

/**
 * Renderizar estadísticas
 */
async function renderStats() {
  const total = reservas.length;
  let maracaibo = 0, caracas = 0, puntofijo = 0;

  // Contar reservas por parque
  reservas.forEach((r) => {
    if (r.parque === "Maracaibo") maracaibo++;
    if (r.parque === "Caracas") caracas++;
    if (r.parque === "Punto Fijo") puntofijo++;
  });

  // Obtener ingresos correctos del backend
  let dinero = 0;
  let moneda = "$";
  try {
    // CORRECCIÓN: Usar API
    const res = await fetch(`${API}/reservations/analytics/stats`, {
      headers: { "x-admin-secret": adminSecret },
    });
    if (res.ok) {
      const stats = await res.json();
      dinero = stats.ingresoTotal || 0;
      moneda = stats.moneda === "BS" ? "Bs" : "$";
    }
  } catch (err) {
    console.error("Error obteniendo estadísticas:", err);
  }

  document.getElementById("total-reservas").textContent = total;
  document.getElementById("total-dinero").textContent = `${moneda}${dinero.toFixed(2)}`;
  document.getElementById("total-maracaibo").textContent = maracaibo;
  document.getElementById("total-caracas").textContent = caracas;
  document.getElementById("total-puntofijo").textContent = puntofijo;
}

/**
 * Renderizar tabla de reservas en el dashboard con búsqueda y filtros mejorados
 */
function renderTable() {
  const tbody = document.querySelector("#tabla-reservas tbody");
  if (!tbody) return;

  // Obtener valores de filtros de barra de búsqueda
  const searchTerm = (document.getElementById("search-input")?.value || "").toLowerCase().trim();
  const filtroParque = document.getElementById("filtro-parque")?.value || "";
  const filtroEstado = document.getElementById("filtro-estado")?.value || "";
  const filtroFechaDesde = document.getElementById("filtro-fecha-desde")?.value || "";
  const filtroFechaHasta = document.getElementById("filtro-fecha-hasta")?.value || "";

  tbody.innerHTML = "";

  // Aplicar todos los filtros
  const reservasFiltradas = reservas.filter((r) => {
    // filtro de búsqueda nombre, teléfono o email
    if (searchTerm) {
      const nombre = (r.nombreCompleto || "").toLowerCase();
      const telefono = (r.telefono || "").toLowerCase();
      const email = (r.correo || "").toLowerCase();

      if (!nombre.includes(searchTerm) &&
        !telefono.includes(searchTerm) &&
        !email.includes(searchTerm)) {
        return false;
      }
    }

    if (filtroParque && r.parque !== filtroParque) return false;
    if (filtroEstado && r.estadoReserva !== filtroEstado) return false;
    if (filtroFechaDesde && r.fechaServicio < filtroFechaDesde) return false;
    if (filtroFechaHasta && r.fechaServicio > filtroFechaHasta) return false;

    return true;
  });

  // Actualizar contador de resultados
  updateResultsCounter(reservasFiltradas.length, reservas.length);

  // Mostrar mensaje si no hay resultados
  if (reservasFiltradas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #6B7280;">
          ${reservas.length === 0 ? "No hay reservas registradas" : "No se encontraron reservas con los filtros aplicados"}
        </td>
      </tr>
    `;
    return;
  }

  // Renderizar filas
  reservasFiltradas.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><div style="font-weight: 600;">${r.nombreCompleto || "N/A"}</div></td>
      <td>
        <div style="font-size: 0.85rem;">${r.correo || "N/A"}</div>
        <div style="font-size: 0.85rem; color: #6B7280;">${r.telefono || "N/A"}</div>
      </td>
      <td>${r.fechaServicio || "N/A"}</td>
      <td>${r.horaReservacion || "N/A"}</td>
      <td><span style="font-weight: 600; color: #7C3AED;">${r.parque || "No especificado"}</span></td>
      <td>${r.paquete || "N/A"}</td>
      <td>${r.tipoEvento || "N/A"}</td>
      <td>
        <select data-id="${r._id}" class="estado-select" style="${r.estadoReserva === "pendiente"
        ? "background: #FEF3C7; color: #92400E;"
        : r.estadoReserva === "aprobado"
          ? "background: #D1FAE5; color: #065F46;"
          : "background: #FEE2E2; color: #991B1B;"
      }">
          <option value="pendiente" ${r.estadoReserva === "pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="aprobado" ${r.estadoReserva === "aprobado" ? "selected" : ""}>Aprobado</option>
          <option value="cancelado" ${r.estadoReserva === "cancelado" ? "selected" : ""}>Cancelado</option>
        </select>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" data-id="${r._id}">Editar</button>
          <button class="btn-delete" data-id="${r._id}">Eliminar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachTableEventListeners();
}

/**
 * Actualizar contador de resultados
 */
function updateResultsCounter(filtered, total) {
  const resultsCount = document.getElementById("results-count");
  const totalCount = document.getElementById("total-count");

  if (resultsCount) resultsCount.textContent = filtered;
  if (totalCount) totalCount.textContent = total;
}

/**
 * Limpiar todos los filtros
 */
function clearAllFilters() {
  const inputs = ["search-input", "filtro-parque", "filtro-estado", "filtro-fecha-desde", "filtro-fecha-hasta"];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  renderTable();
}

/**
 * Atachar listeners de la tabla
 */
function attachTableEventListeners() {
  // Cambiar estado
  document.querySelectorAll(".estado-select").forEach((sel) => {
    sel.addEventListener("change", async (e) => {
      const id = sel.dataset.id;
      const estado = sel.value;

      // Feedback visual: Deshabilitar mientras carga
      sel.disabled = true;

      try {
        // CORRECCIÓN CRÍTICA: Ruta correcta para cambiar estado (/reservas/:id/estado)
        const res = await fetch(
          `${API}/reservations/${id}/estado`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-admin-secret": adminSecret,
            },
            body: JSON.stringify({ estadoReserva: estado }),
          }
        );
        if (res.ok) {
          // Éxito: recargar para ver cambios (colores, etc)
          cargarReservas();

          // Toast de éxito (Opcional, pero se ve bien)
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          });
          Toast.fire({ icon: 'success', title: 'Estado actualizado' });

        } else {
          throw new Error("Falló actualización");
        }
      } catch (err) {
        console.error("Error:", err);
        Swal.fire({
          text: "No se pudo actualizar el estado",
          icon: "error",
          confirmButtonColor: "#7C3AED",
        });
        sel.disabled = false; // Reactivar si falló
        sel.value = reservas.find(r => r._id === id).estadoReserva; // Volver al valor anterior
      }
    });
  });

  // Eliminar
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const result = await Swal.fire({
        title: "¿Eliminar reserva?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#6B7280",
      });

      if (result.isConfirmed) {
        try {
          // CORRECCIÓN: Usar API
          const res = await fetch(
            `${API}/admin/reservas/${id}`,
            {
              method: "DELETE",
              headers: { "x-admin-secret": adminSecret },
            }
          );
          if (res.ok) {
            Swal.fire({
              text: "Reserva eliminada",
              icon: "success",
              confirmButtonColor: "#7C3AED",
              timer: 1500,
              showConfirmButton: false,
            });
            cargarReservas();
          }
        } catch (err) {
          console.error("Error:", err);
        }
      }
    });
  });

  // Editar reserva completa
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const reserva = reservas.find((r) => r._id === id);
      if (!reserva) return;

      const { value: formValues } = await Swal.fire({
        title: "Editar Reserva Completa",
        html: `
          <div style="text-align: left; padding: 1rem; max-height: 500px; overflow-y: auto;">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Nombre:</label>
              <input id="edit-nombre" class="swal2-input" style="width: 90%; margin: 0;" value="${reserva.nombreCompleto}">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Correo:</label>
              <input id="edit-correo" type="email" class="swal2-input" style="width: 90%; margin: 0;" value="${reserva.correo}">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Teléfono:</label>
              <input id="edit-telefono" type="tel" class="swal2-input" style="width: 90%; margin: 0;" value="${reserva.telefono}">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Fecha:</label>
              <input id="edit-fecha" type="date" class="swal2-input" style="width: 90%; margin: 0;" value="${reserva.fechaServicio}">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Hora:</label>
              <select id="edit-hora" class="swal2-input" style="width: 90%; margin: 0;">
                <option value="10am-1pm" ${reserva.horaReservacion === "10am-1pm" ? "selected" : ""}>10am - 1pm</option>
                <option value="2pm-5pm" ${reserva.horaReservacion === "2pm-5pm" ? "selected" : ""}>2pm - 5pm</option>
                <option value="6pm-9pm" ${reserva.horaReservacion === "6pm-9pm" ? "selected" : ""}>6pm - 9pm</option>
              </select>
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Parque:</label>
              <select id="edit-parque" class="swal2-input" style="width: 90%; margin: 0;">
                <option value="Maracaibo" ${reserva.parque === "Maracaibo" ? "selected" : ""}>Maracaibo</option>
                <option value="Caracas" ${reserva.parque === "Caracas" ? "selected" : ""}>Caracas</option>
                <option value="Punto Fijo" ${reserva.parque === "Punto Fijo" ? "selected" : ""}>Punto Fijo</option>
              </select>
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Paquete:</label>
              <select id="edit-paquete" class="swal2-input" style="width: 90%; margin: 0;">
                <option value="mini" ${reserva.paquete === "mini" ? "selected" : ""}>Mini</option>
                <option value="mediano" ${reserva.paquete === "mediano" ? "selected" : ""}>Mediano</option>
                <option value="full" ${reserva.paquete === "full" ? "selected" : ""}>Full</option>
              </select>
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Tipo de Evento:</label>
              <input id="edit-evento" class="swal2-input" style="width: 90%; margin: 0;" value="${reserva.tipoEvento || ""}">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
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
            tipoEvento: document.getElementById("edit-evento").value,
            estadoUbicacion: reserva.estadoUbicacion || "Venezuela",
          };
        },
      });

      if (formValues) {
        try {
          // CORRECCIÓN: Usar API y método PUT para editar datos
          const res = await fetch(
            `${API}/reservations/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                // "x-admin-secret": adminSecret, // Descomenta si tu backend lo exige en esta ruta
              },
              body: JSON.stringify(formValues),
            }
          );
          if (res.ok) {
            Swal.fire({
              text: "Reserva actualizada",
              icon: "success",
              confirmButtonColor: "#7C3AED",
              timer: 1500,
              showConfirmButton: false,
            });
            cargarReservas();
          }
        } catch (err) {
          console.error("Error:", err);
        }
      }
    });
  });

  // Event listeners para búsqueda y filtros
  const searchInput = document.getElementById("search-input");
  const filtroParque = document.getElementById("filtro-parque");
  const filtroEstado = document.getElementById("filtro-estado");
  const filtroFechaDesde = document.getElementById("filtro-fecha-desde");
  const filtroFechaHasta = document.getElementById("filtro-fecha-hasta");
  const clearFiltersBtn = document.getElementById("clear-filters-btn");

  if (searchInput && !searchInput.dataset.listenerAttached) {
    searchInput.addEventListener("input", renderTable);
    searchInput.dataset.listenerAttached = "true";
  }
  if (filtroParque && !filtroParque.dataset.listenerAttached) {
    filtroParque.addEventListener("change", renderTable);
    filtroParque.dataset.listenerAttached = "true";
  }
  if (filtroEstado && !filtroEstado.dataset.listenerAttached) {
    filtroEstado.addEventListener("change", renderTable);
    filtroEstado.dataset.listenerAttached = "true";
  }
  if (filtroFechaDesde && !filtroFechaDesde.dataset.listenerAttached) {
    filtroFechaDesde.addEventListener("change", renderTable);
    filtroFechaDesde.dataset.listenerAttached = "true";
  }
  if (filtroFechaHasta && !filtroFechaHasta.dataset.listenerAttached) {
    filtroFechaHasta.addEventListener("change", renderTable);
    filtroFechaHasta.dataset.listenerAttached = "true";
  }
  if (clearFiltersBtn && !clearFiltersBtn.dataset.listenerAttached) {
    clearFiltersBtn.addEventListener("click", clearAllFilters);
    clearFiltersBtn.dataset.listenerAttached = "true";
  }
}

/**
 * Renderizar gráfica principal de reservas
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
      datasets: [
        {
          label: "Reservas",
          data: [
            reservas.filter((r) => r.parque === "Maracaibo").length,
            reservas.filter((r) => r.parque === "Caracas").length,
            reservas.filter((r) => r.parque === "Punto Fijo").length,
          ],
          backgroundColor: ["#7C3AED", "#A78BFA", "#C4B5FD"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}

/**
 * Renderizar calendario de reservas
 */
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
  const prevLastDayDate = prevLastDay.getDate();
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

  dayNames.forEach((day) => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });

  for (let x = firstDayIndex; x > 0; x--) {
    html += `<div class="calendar-day other-month">${prevLastDayDate - x + 1
      }</div>`;
  }

  const today = new Date();
  for (let i = 1; i <= lastDayDate; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(i).padStart(2, "0")}`;
    const hasReservation = reservas.some((r) => r.fechaServicio === dateStr);
    const isToday =
      i === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

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
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function showDayReservations(dateStr) {
  const dayReservations = reservas.filter((r) => r.fechaServicio === dateStr);

  if (dayReservations.length === 0) {
    Swal.fire({
      title: `Reservas del ${dateStr}`,
      text: "No hay reservas para este día",
      icon: "info",
      confirmButtonColor: "#7C3AED",
    });
    return;
  }

  const html = dayReservations.map((r) => `
    <div style="text-align: left; padding: 1rem; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 0.5rem;">
      <strong>${r.nombreCompleto}</strong><br>
      <small>${r.parque} - ${r.horaReservacion}</small><br>
      <small>Paquete: ${r.paquete}</small>
    </div>
  `).join("");

  Swal.fire({
    title: `Reservas del ${dateStr}`,
    html: html,
    confirmButtonColor: "#7C3AED",
    width: 600,
  });
}

function updateNotifications() {
  const pendientes = reservas.filter((r) => r.estadoReserva === "pendiente").length;
  const badge = document.getElementById("notification-count");
  if (badge) {
    badge.textContent = pendientes;
    badge.style.display = pendientes > 0 ? "block" : "none";
  }
}

function mostrarNotificaciones() {
  const pendientes = reservas.filter((r) => r.estadoReserva === "pendiente");

  if (pendientes.length === 0) {
    Swal.fire({
      title: "Notificaciones",
      text: "No hay reservas pendientes",
      icon: "info",
      confirmButtonColor: "#7C3AED",
    });
    return;
  }

  const html = pendientes.map((r) => `
    <div style="text-align: left; padding: 1rem; border: 1px solid #FEF3C7; background: #FFFBEB; border-radius: 8px; margin-bottom: 0.5rem;">
      <strong>${r.nombreCompleto}</strong><br>
      <small>${r.fechaServicio} - ${r.horaReservacion}</small><br>
      <small>${r.parque} - ${r.paquete}</small>
    </div>
  `).join("");

  Swal.fire({
    title: `${pendientes.length} Reservas Pendientes`,
    html: html,
    confirmButtonColor: "#7C3AED",
    width: 600,
  });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(124, 58, 237);
  doc.text("BRINCAPARK - Reporte de Reservas", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, 14, 28);

  const tableData = reservas.map((r) => [
    r.nombreCompleto,
    r.parque,
    r.fechaServicio,
    r.horaReservacion,
    r.paquete,
    r.estadoReserva,
  ]);

  doc.autoTable({
    head: [["Cliente", "Parque", "Fecha", "Hora", "Paquete", "Estado"]],
    body: tableData,
    startY: 35,
    headStyles: { fillColor: [124, 58, 237] },
  });

  doc.save(`BRINCAPARK_Reservas_${new Date().toISOString().split("T")[0]}.pdf`);
}

function exportarExcel() {
  const data = reservas.map((r) => ({
    Cliente: r.nombreCompleto,
    Correo: r.correo,
    Teléfono: r.telefono,
    Parque: r.parque,
    Fecha: r.fechaServicio,
    Hora: r.horaReservacion,
    Paquete: r.paquete,
    "Tipo Evento": r.tipoEvento,
    Estado: r.estadoReserva,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reservas");
  XLSX.writeFile(
    wb,
    `BRINCAPARK_Reservas_${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

// Funciones globales
window.changeMonth = changeMonth;
window.showDayReservations = showDayReservations;