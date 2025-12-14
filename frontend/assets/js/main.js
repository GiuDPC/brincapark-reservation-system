// main.js - Lógica Frontend, Menú y Animaciones

// Función principal de inicialización
function initApp() {
  console.log("Init App ejecutado");

  // --- MENÚ HAMBURGUESA (Lógica Simplificada) ---
  const menuBtn = document.getElementById('mobile-menu');
  const navMenu = document.querySelector('.navbar-menu');
  const links = document.querySelectorAll('.navbar-menu a');

  // Aseguramos que el botón exista antes de agregar evento
  if (menuBtn && navMenu) {
    // Limpiamos eventos previos clonando el nodo
    const newBtn = menuBtn.cloneNode(true);
    menuBtn.parentNode.replaceChild(newBtn, menuBtn);

    newBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      newBtn.classList.toggle('is-active');
    });

    // Cerrar menú al tocar un enlace
    links.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        newBtn.classList.remove('is-active');
      });
    });
  }

  // --- NAVBAR SCROLL ---
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });

  // --- RE-INICIALIZAR COMPONENTES ---
  if (document.getElementById("gallery-carousel")) initCarousel();
  if (document.getElementById("reservation-form")) initFormulario();
  if (typeof inicializarPreciosDinamicos === 'function') inicializarPreciosDinamicos();
}

// Lógica Carrusel
function initCarousel() {
  const items = document.querySelectorAll(".carousel-item");
  const dots = document.querySelectorAll(".indicator");
  const prev = document.getElementById("carousel-prev");
  const next = document.getElementById("carousel-next");
  let curr = 0;
  let interval;

  function show(i) {
    items.forEach(el => el.classList.remove("active"));
    dots.forEach(el => el.classList.remove("active"));
    if(items[i]) {
      items[i].classList.add("active");
      dots[i].classList.add("active");
      curr = i;
    }
  }

  function auto() { interval = setInterval(() => show((curr + 1) % items.length), 5000); }
  function reset() { clearInterval(interval); auto(); }

  if(next) next.addEventListener("click", () => { show((curr + 1) % items.length); reset(); });
  if(prev) prev.addEventListener("click", () => { show((curr - 1 + items.length) % items.length); reset(); });
  
  auto();
}

// Lógica Formulario
function initFormulario() {
  const form = document.getElementById("reservation-form");
  const dateInput = document.getElementById("date");
  const parqueSelect = document.getElementById("parque");
  const horaSelect = document.getElementById("horaReservacion");

  async function checkHorarios() {
    if(!dateInput.value || !parqueSelect.value) return;
    try {
      const apiUrl = window.API_BASE_URL || "/api";
      const res = await fetch(`${apiUrl}/reservations/horarios-ocupados?fechaServicio=${dateInput.value}&parque=${parqueSelect.value}`);
      const data = await res.json();
      const ocupados = data.horariosOcupados || [];
      
      horaSelect.querySelectorAll("option").forEach(opt => {
        if(opt.value) {
          opt.disabled = ocupados.includes(opt.value);
          opt.textContent = ocupados.includes(opt.value) ? `${opt.value} (Ocupado)` : opt.value;
        }
      });
    } catch(e) { console.error(e); }
  }

  if(dateInput) dateInput.addEventListener("change", checkHorarios);
  if(parqueSelect) parqueSelect.addEventListener("change", checkHorarios);

  if(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const txt = btn.textContent;
      btn.disabled = true; btn.textContent = "Enviando...";
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      if(!data.tipoEvento) data.tipoEvento = data.paquete;

      try {
        if(typeof crearReserva === 'function') {
          await crearReserva(data);
          Swal.fire("¡Éxito!", "Reserva enviada correctamente", "success");
          form.reset();
          checkHorarios();
        }
      } catch(e) { Swal.fire("Error", "No se pudo enviar", "error"); } 
      finally { btn.disabled = false; btn.textContent = txt; }
    });
  }
}

// CONFIGURACIÓN BARBA.JS (Animación)
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== 'undefined' && typeof barba !== 'undefined') {
    
    // Posición inicial de la cortina (escondida abajo)
    gsap.set(".transition-overlay", { y: "100%" });

    barba.init({
      sync: true,
      transitions: [{
        name: 'default-transition',
        // AL SALIR: Sube la cortina
        leave(data) {
          return gsap.to(".transition-overlay", {
            y: "0%",
            duration: 0.6,
            ease: "power2.inOut"
          });
        },
        // AL ENTRAR: Baja la cortina hacia arriba (revelando contenido)
        enter(data) {
          initApp(); // Importante: Reiniciar JS
          window.scrollTo(0, 0); // Subir scroll
          
          return gsap.to(".transition-overlay", {
            y: "-100%",
            duration: 1,
            ease: "power2.inOut",
            delay: 0.2 // Pequeña pausa para que cargue
          });
        }
      }]
    });
  }
  
  // Carga inicial
  initApp();
});