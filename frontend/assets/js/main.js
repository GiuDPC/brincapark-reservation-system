function initApp() {
  console.log("Init App");

  // MENÚ HAMBURGUESA (Delegación de eventos = No falla)
  const body = document.body;

  // Limpiar listener anterior para no duplicar
  if (window.menuListener) body.removeEventListener('click', window.menuListener);

  window.menuListener = function (e) {
    const btn = e.target.closest('.menu-toggle');
    const menu = document.querySelector('.navbar-menu');
    const link = e.target.closest('.navbar-menu a');
    const toggleIcon = document.querySelector('.menu-toggle');

    if (!menu) return;

    // Abrir/Cerrar
    if (btn) {
      e.stopPropagation();
      menu.classList.toggle('active');
      toggleIcon.classList.toggle('is-active');
    }

    // Cerrar al clickear enlace
    if (link) {
      menu.classList.remove('active');
      if (toggleIcon) toggleIcon.classList.remove('is-active');
    }
  };

  document.addEventListener('click', window.menuListener);

  // Scroll Navbar
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    });
  }

  // Componentes
  if (document.getElementById("gallery-carousel")) initCarousel();
  if (document.getElementById("reservation-form")) initFormulario();
  if (typeof inicializarPreciosDinamicos === 'function') inicializarPreciosDinamicos();

  // Animaciones de entrada para secciones (scroll reveal)
  animarSeccionesAlCargar();
}

// Animación de secciones al cargar la página
function animarSeccionesAlCargar() {
  if (typeof gsap === 'undefined') return;

  // Animar hero
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image');

  if (heroContent && heroImage) {
    gsap.fromTo(heroContent,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
    );
    gsap.fromTo(heroImage,
      { opacity: 0, x: 50, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.4 }
    );
  }

  // Animar tarjetas de tickets y paquetes con stagger
  const ticketCards = document.querySelectorAll('.ticket-card');
  if (ticketCards.length > 0) {
    gsap.fromTo(ticketCards,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)", delay: 0.3 }
    );
  }

  const paqueteCards = document.querySelectorAll('.paquete-card');
  if (paqueteCards.length > 0) {
    gsap.fromTo(paqueteCards,
      { opacity: 0, y: 40, rotationX: 10 },
      { opacity: 1, y: 0, rotationX: 0, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 0.3 }
    );
  }
}

// BARBA.JS CONFIGURACIÓN MEJORADA
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== 'undefined' && typeof barba !== 'undefined') {

    gsap.set(".transition-overlay", { y: "100%" });

    barba.init({
      sync: true,
      preventRunning: true,
      transitions: [{
        name: 'spectacular-slide',

        // Antes de salir: Fade out del contenido actual
        beforeLeave(data) {
          // Animar elementos específicos hacia afuera
          const cards = data.current.container.querySelectorAll('.ticket-card, .paquete-card');
          if (cards.length > 0) {
            gsap.to(cards, {
              opacity: 0,
              y: -20,
              scale: 0.95,
              duration: 0.3,
              stagger: 0.05
            });
          }
        },

        // SALIDA: Cortina sube y tapa con efecto de onda
        leave(data) {
          const tl = gsap.timeline();

          // Fade out suave del contenido
          tl.to(data.current.container, {
            opacity: 0.3,
            duration: 0.3,
            ease: "power2.in"
          }, 0);

          // Cortina sube con efecto elástico
          tl.to(".transition-overlay", {
            y: "0%",
            duration: 0.5,
            ease: "power3.inOut"
          }, 0.1);

          return tl;
        },

        // ENTRADA: Cortina revela con animaciones
        enter(data) {
          window.scrollTo(0, 0);

          const tl = gsap.timeline();

          // Preparar nuevo contenedor
          gsap.set(data.next.container, { opacity: 0 });

          // Cortina baja para revelar
          tl.to(".transition-overlay", {
            y: "-100%",
            duration: 0.6,
            ease: "power3.inOut",
            delay: 0.1
          });

          // Fade in del nuevo contenido
          tl.to(data.next.container, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          }, "-=0.3");

          return tl;
        },

        // Después de entrar: Reiniciar scripts y animar elementos
        afterEnter(data) {
          initApp();
        }
      }],

      // Vistas específicas para páginas
      views: [{
        namespace: 'home',
        afterEnter(data) {
          console.log('Entrando a Home');
          animarSeccionesAlCargar();
        }
      }, {
        namespace: 'normativas',
        afterEnter(data) {
          console.log('Entrando a Normativas');
          // Animar tarjetas de normativas
          const cards = document.querySelectorAll('.normativa-card, .policy-card');
          if (cards.length > 0) {
            gsap.fromTo(cards,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 }
            );
          }
        }
      }]
    });
  }
  initApp();
});