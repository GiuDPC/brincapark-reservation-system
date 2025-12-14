// main.js - Lógica Frontend + Barba.js Profesional

// 1. INICIALIZADOR DE LA APP
function initApp() {
  console.log("🚀 Init App ejecutado");

  // --- MENÚ HAMBURGUESA ---
  const mobileMenuBtn = document.getElementById("mobile-menu");
  const navbarMenu = document.querySelector(".navbar-menu");
  const navLinks = document.querySelectorAll(".navbar-menu a");

  // Eliminar listeners viejos clonando el botón
  if (mobileMenuBtn) {
    const newBtn = mobileMenuBtn.cloneNode(true);
    mobileMenuBtn.parentNode.replaceChild(newBtn, mobileMenuBtn);
    
    newBtn.addEventListener("click", () => {
      // Toggle clases
      navbarMenu.classList.toggle("active");
      newBtn.classList.toggle("is-active");
      
      // Animación secuencial de los enlaces (stagger)
      if (navbarMenu.classList.contains("active")) {
        navLinks.forEach((link, index) => {
          link.style.transitionDelay = `${0.1 * (index + 1)}s`;
        });
      } else {
        navLinks.forEach(link => { link.style.transitionDelay = '0s'; });
      }
    });
  }

  // Cerrar menú al navegar
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navbarMenu.classList.remove("active");
      const btn = document.getElementById("mobile-menu");
      if(btn) btn.classList.remove("is-active");
    });
  });

  // --- NAVBAR SCROLL ---
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });

  // --- COMPONENTES ---
  if (document.getElementById("gallery-carousel")) initCarousel();
  if (document.getElementById("reservation-form")) initFormulario();
  if (typeof inicializarPreciosDinamicos === 'function') inicializarPreciosDinamicos();
}

// 2. CARRUSEL
function initCarousel() {
  const carouselItems = document.querySelectorAll(".carousel-item");
  const indicators = document.querySelectorAll(".indicator");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  let currentSlide = 0;
  let autoPlayInterval;

  function showSlide(index) {
    carouselItems.forEach(item => item.classList.remove("active"));
    indicators.forEach(ind => ind.classList.remove("active"));
    if(carouselItems[index]) {
      carouselItems[index].classList.add("active");
      indicators[index].classList.add("active");
      currentSlide = index;
    }
  }

  function nextSlide() { showSlide((currentSlide + 1) % carouselItems.length); }
  function prevSlide() { showSlide((currentSlide - 1 + carouselItems.length) % carouselItems.length); }

  if(nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); resetAutoPlay(); });
  if(prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); resetAutoPlay(); });
  indicators.forEach((ind, i) => ind.addEventListener("click", () => { showSlide(i); resetAutoPlay(); }));

  function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); }
  function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); }
  
  startAutoPlay();
}

// 3. FORMULARIO
function initFormulario() {
  const form = document.getElementById("reservation-form");
  const horaSelect = document.getElementById("horaReservacion");
  const parqueSelect = document.getElementById("parque");
  const dateInput = document.getElementById("date");

  async function actualizarHorarios() {
    const fecha = dateInput.value;
    const parque = parqueSelect.value;
    if (!fecha || !parque) return;
    try {
      const apiUrl = window.API_BASE_URL || "/api"; 
      const res = await fetch(`${apiUrl}/reservations/horarios-ocupados?fechaServicio=${fecha}&parque=${parque}`);
      const data = await res.json();
      const ocupados = data.horariosOcupados || [];
      horaSelect.querySelectorAll("option").forEach(opt => {
        if(opt.value) {
          opt.disabled = ocupados.includes(opt.value);
          opt.textContent = ocupados.includes(opt.value) ? `${opt.value} (Ocupado)` : opt.value;
        }
      });
    } catch (err) { console.error(err); }
  }

  if(dateInput) dateInput.addEventListener("change", actualizarHorarios);
  if(parqueSelect) parqueSelect.addEventListener("change", actualizarHorarios);

  if(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const txt = btn.textContent;
      btn.disabled = true; btn.textContent = "Enviando...";
      
      const formData = new FormData(form);
      const datos = Object.fromEntries(formData.entries());
      if(!datos.tipoEvento) datos.tipoEvento = datos.paquete;

      try {
        if(typeof crearReserva === 'function') {
          await crearReserva(datos);
          Swal.fire("¡Éxito!", "Tu reserva ha sido enviada.", "success");
          form.reset();
          actualizarHorarios();
        }
      } catch (err) {
        Swal.fire("Error", "No se pudo crear la reserva.", "error");
      } finally {
        btn.disabled = false; btn.textContent = txt;
      }
    });
  }
}

// 4. CONFIGURACIÓN BARBA.JS (Animación Profesional)
document.addEventListener("DOMContentLoaded", () => {
  
  if (typeof gsap !== 'undefined' && typeof barba !== 'undefined') {
    
    // Configurar posición inicial de la cortina
    gsap.set(".transition-overlay", { y: "100%" });

    barba.init({
      sync: true,
      transitions: [{
        name: 'page-transition',
        
        // AL SALIR (La cortina sube y tapa todo)
        leave(data) {
          return gsap.timeline()
            .to(data.current.container, { opacity: 0, duration: 0.5 })
            .to(".transition-overlay", { 
              y: "0%", 
              duration: 0.8, 
              ease: "power4.inOut" 
            }, "-=0.5");
        },

        // AL ENTRAR (La cortina baja y revela lo nuevo)
        enter(data) {
          initApp(); // Reiniciar JS
          window.scrollTo(0, 0);
          
          return gsap.timeline()
            .from(data.next.container, { opacity: 0, duration: 0.5 })
            .to(".transition-overlay", { 
              y: "-100%", 
              duration: 0.8, 
              ease: "power4.inOut" 
            }, "-=0.5");
        }
      }]
    });
  } else {
    console.warn("GSAP/Barba no cargados.");
  }

  // Carga inicial
  initApp();
});