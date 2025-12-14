// main.js - Lógica Frontend + Barba.js Profesional

// 1. INICIALIZADOR DE LA APP
function initApp() {
  console.log("🚀 Init App ejecutado");

  // --- MENÚ HAMBURGUESA (Corrección Lógica) ---
  // Usamos selectores directos
  const menuBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.navbar-menu');
  const navLinks = document.querySelectorAll('.navbar-menu a');

  // Clonamos el botón para eliminar cualquier evento viejo que haya quedado
  if (menuBtn) {
    const newBtn = menuBtn.cloneNode(true);
    menuBtn.parentNode.replaceChild(newBtn, menuBtn);
    
    // Agregamos el evento al nuevo botón
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita que el clic se propague
      navMenu.classList.toggle('active');
      newBtn.classList.toggle('is-active');
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        newBtn.classList.remove('is-active');
      });
    });

    // Cerrar menú si tocas fuera
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !newBtn.contains(e.target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        newBtn.classList.remove('is-active');
      }
    });
  }

  // --- NAVBAR SCROLL ---
  const navbar = document.querySelector(".navbar");
  if(navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    });
  }

  // --- RE-INICIALIZAR COMPONENTES ---
  if (document.getElementById("gallery-carousel")) initCarousel(); 
  if (document.getElementById("reservation-form")) initFormulario();
  if (typeof inicializarPreciosDinamicos === 'function') inicializarPreciosDinamicos();
}

// ... (MANTÉN TUS FUNCIONES initCarousel e initFormulario AQUÍ IGUAL QUE ANTES) ...
// Copia aquí las funciones initCarousel e initFormulario del código anterior 
// (Si las necesitas de nuevo dímelo, pero son las mismas)

// Lógica Carrusel (Resumida para este archivo)
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

// Lógica Formulario (Resumida)
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

// 4. CONFIGURACIÓN BARBA.JS (Animación Suave y Elegante)
document.addEventListener("DOMContentLoaded", () => {
  
  if (typeof gsap !== 'undefined' && typeof barba !== 'undefined') {
    
    // Asegurar posición inicial
    gsap.set(".transition-overlay", { y: "100%" });

    barba.init({
      sync: true,
      transitions: [{
        name: 'fade-transition',
        // SALIDA: Cortina sube suavemente
        leave(data) {
          return gsap.to(".transition-overlay", {
            y: "0%",
            duration: 0.8,
            ease: "power2.inOut"
          });
        },
        // ENTRADA: Cortina sigue subiendo (desaparece por arriba)
// Reemplaza SOLO esta parte dentro de barba.init
        enter(data) {
          initApp(); // Reinicia scripts
          window.scrollTo(0, 0); // Sube al tope
          
          // Animación suave de subida (efecto telón)
          return gsap.fromTo(".transition-overlay", 
            { y: "0%" }, // Empieza cubriendo la pantalla
            { 
              y: "-100%", // Sube hasta desaparecer
              duration: 0.8, 
              ease: "power2.inOut",
              delay: 0.1 
            }
          );
        }
      }]
    });
  } else {
    // Si falla Barba, inicializar normal
    initApp();
  }
  
  // Ejecución inicial obligatoria
  initApp();
});