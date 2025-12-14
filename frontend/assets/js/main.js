function initApp() {
  console.log("Init App");

  // MENÚ HAMBURGUESA (Delegación de eventos = No falla)
  const body = document.body;
  
  // Limpiar listener anterior para no duplicar
  if (window.menuListener) body.removeEventListener('click', window.menuListener);

  window.menuListener = function(e) {
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
      if(toggleIcon) toggleIcon.classList.remove('is-active');
    }
  };

  document.addEventListener('click', window.menuListener);

  // Scroll Navbar
  const navbar = document.querySelector(".navbar");
  if(navbar) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
      });
  }

  // Componentes
  if (document.getElementById("gallery-carousel")) initCarousel(); 
  if (document.getElementById("reservation-form")) initFormulario();
  if (typeof inicializarPreciosDinamicos === 'function') inicializarPreciosDinamicos();
}

// BARBA.JS CONFIGURACIÓN
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== 'undefined' && typeof barba !== 'undefined') {
    
    gsap.set(".transition-overlay", { y: "100%" });

    barba.init({
      sync: true,
      transitions: [{
        name: 'spectacular',
        
        // SALIDA: Cortina sube y tapa
        leave(data) {
          return gsap.to(".transition-overlay", {
            y: "0%",
            duration: 0.6,
            ease: "power2.inOut"
          });
        },

        // ENTRADA: Cortina sigue subiendo (Revela)
        enter(data) {
          initApp(); // Reinicia scripts
          window.scrollTo(0, 0); // Scroll arriba INSTANTÁNEO

          // Animación suave hacia arriba
          return gsap.fromTo(".transition-overlay", 
            { y: "0%" },
            { 
              y: "-100%", 
              duration: 0.8, 
              ease: "power2.inOut",
              delay: 0.1
            }
          );
        }
      }]
    });
  }
  initApp();
});