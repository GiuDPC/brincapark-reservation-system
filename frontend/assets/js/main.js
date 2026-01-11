// Carrusel

function initCarousel() {
  const container = document.getElementById('gallery-carousel');
  if (!container) return;

  const track = container.querySelector('.carousel-track');
  const items = container.querySelectorAll('.carousel-item');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || items.length === 0) return;

  let currentIndex = 0;
  let autoPlayInterval = null;
  let touchStartX = 0;
  let touchEndX = 0;

  // Usar indicadores existentes del HTML
  const wrapper = container.closest('.carousel-wrapper');
  let indicators = null;

  if (wrapper) {
    const indicatorContainer = wrapper.querySelector('.carousel-indicators');
    if (indicatorContainer) {
      // Usar indicadores existentes (clase .indicator del HTML)
      indicators = indicatorContainer.querySelectorAll('.indicator, .carousel-indicator');

      // Agregar evento click a cada indicador
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
      });
    }
  }

  // Ir a slide especifico
  function goToSlide(index) {
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;

    // Quitar clase active del item actual
    items[currentIndex].classList.remove('active');
    if (indicators) indicators[currentIndex].classList.remove('active');

    // Actualizar indice
    currentIndex = index;

    // Agregar clase active al nuevo item
    items[currentIndex].classList.add('active');
    if (indicators) indicators[currentIndex].classList.add('active');
  }

  // Siguiente slide
  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  // Slide anterior
  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Auto play
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(nextSlide, 4000); // Cambiar cada 4 segundos
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  // Event listeners para botones
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoPlay(); // Reiniciar autoplay despues de interaccion
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  // Soporte para touch/swipe en moviles
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoPlay();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide(); // Swipe izquierda = siguiente
      } else {
        prevSlide(); // Swipe derecha = anterior
      }
    }
  }

  // Pausar autoplay cuando el mouse esta sobre el carrusel
  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  // Iniciar autoplay
  startAutoPlay();

  // Asegurar que el primer item este activo
  items[0].classList.add('active');

  console.log('Carrusel inicializado con', items.length, 'imagenes');
}

// Placeholder para formulario (si no existe)
function initFormulario() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  // Mapa de parques a estados
  const parqueEstadoMap = {
    'Maracaibo': 'Zulia',
    'Caracas': 'Distrito Capital',
    'Punto Fijo': 'Falcón'
  };

  // Función de sanitización básica (prevenir XSS simple)
  const sanitizeInput = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Validaciones regex
  const validations = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    phone: /^[0-9]{11}$/,
    name: /^[a-zA-ZÀ-ÿ\s]{3,50}$/ // Solo letras y espacios, mín 3, máx 50
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Obtener valores
    const nameVal = form.querySelector('#name').value.trim();
    const emailVal = form.querySelector('#email').value.trim();
    const phoneVal = form.querySelector('#phone').value.trim();
    const packageVal = form.querySelector('#package').value;
    const dateVal = form.querySelector('#date').value;
    const parqueVal = form.querySelector('#parque').value;
    const horaVal = form.querySelector('#horaReservacion').value;
    const tipoVal = form.querySelector('#tipoEvento').value;

    // Validación lado cliente estricta
    if (!validations.name.test(nameVal)) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre inválido',
        text: 'El nombre debe contener solo letras y tener al menos 3 caracteres.',
        confirmButtonColor: '#4b0082'
      });
      return;
    }

    if (!validations.email.test(emailVal)) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Por favor ingresa un correo electrónico válido.',
        confirmButtonColor: '#4b0082'
      });
      return;
    }

    if (!validations.phone.test(phoneVal)) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'El teléfono debe tener 11 dígitos numéricos.',
        confirmButtonColor: '#4b0082'
      });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      // Construir objeto con claves que espera el backend
      const datos = {
        nombreCompleto: sanitizeInput(nameVal),
        correo: sanitizeInput(emailVal),
        telefono: sanitizeInput(phoneVal),
        paquete: packageVal,
        fechaServicio: dateVal,
        parque: parqueVal,
        horaReservacion: horaVal,
        tipoEvento: tipoVal,
        // Derivar estadoUbicacion del parque seleccionado
        estadoUbicacion: parqueEstadoMap[parqueVal] || 'Desconocido'
      };

      console.log('Enviando datos:', datos); // Debug

      await crearReserva(datos);

      Swal.fire({
        icon: 'success',
        title: '¡Reserva enviada!',
        text: 'Te contactaremos pronto para confirmar tu reserva.',
        confirmButtonColor: '#4b0082'
      });

      form.reset();
    } catch (error) {
      console.error('Error al enviar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo enviar la reserva. Intenta nuevamente.',
        confirmButtonColor: '#4b0082'
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  console.log('Formulario inicializado con validaciones y seguridad');
}

// Parallax

function initParallax() {
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');

  if (!hero) return;

  let ticking = false;

  // Factor de parallax: menor en móvil para mejor rendimiento
  const isMobile = window.innerWidth < 768;
  const parallaxFactor = isMobile ? 0.15 : 0.3;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroHeight = hero.offsetHeight;

    // Solo aplicar si estamos en el viewport del hero
    if (scrolled <= heroHeight) {
      // Mover la imagen del hero más lento que el scroll
      if (heroImage) {
        const yPos = scrolled * parallaxFactor;
        heroImage.style.transform = `translateY(${yPos}px)`;
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  console.log('Parallax inicializado' + (isMobile ? ' (modo móvil)' : ''));
}

// Scroll reveal

function initScrollReveal() {
  // Seleccionar todos los elementos con clases reveal
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (revealElements.length === 0) return;

  // Configuracion del observer
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px 0px -50px 0px', // trigger un poco antes de llegar
    threshold: 0.1 // 10% del elemento visible
  };

  // Callback cuando un elemento entra al viewport
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Dejar de observar una vez revelado
        observer.unobserve(entry.target);
      }
    });
  };

  // Crear observer
  const revealObserver = new IntersectionObserver(observerCallback, observerOptions);

  // Observar cada elemento
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  console.log('Scroll Reveal inicializado para', revealElements.length, 'elementos');
}

// Agregar clases de animación

function addAnimationClasses() {
  // Hero
  const heroContent = document.querySelector('.hero-content');
  if (heroContent && !heroContent.classList.contains('reveal-left')) {
    heroContent.classList.add('reveal-left');
  }

  const heroImage = document.querySelector('.hero-image');
  if (heroImage && !heroImage.classList.contains('reveal-right')) {
    heroImage.classList.add('reveal-right');
  }

  // Títulos
  const sectionTitles = document.querySelectorAll('.section-title');
  sectionTitles.forEach(title => {
    if (!title.classList.contains('reveal')) {
      title.classList.add('reveal');
    }
  });

  // Tickets
  const ticketCards = document.querySelectorAll('.ticket-card');
  ticketCards.forEach((card, index) => {
    if (!card.classList.contains('reveal-scale')) {
      card.classList.add('reveal-scale', 'hover-lift', `reveal-delay-${(index % 4) + 1}`);
    }
  });

  // Paquetes
  const paqueteCards = document.querySelectorAll('.paquete-card');
  paqueteCards.forEach((card, index) => {
    if (!card.classList.contains('reveal-scale')) {
      card.classList.add('reveal-scale', 'hover-lift', `reveal-delay-${(index % 4) + 1}`);
    }
  });

  // Beneficios
  const beneficios = document.querySelectorAll('.beneficios-container, .beneficios-section');
  beneficios.forEach(b => {
    if (!b.classList.contains('reveal')) {
      b.classList.add('reveal');
    }
  });

  // Formulario
  const formulario = document.querySelector('.formulario-section, .formulario-content');
  if (formulario && !formulario.classList.contains('reveal')) {
    formulario.classList.add('reveal');
  }

  // Galería
  const galeriaSection = document.querySelector('.galeria-section');
  if (galeriaSection && !galeriaSection.classList.contains('reveal')) {
    galeriaSection.classList.add('reveal');
  }

  const carousel = document.querySelector('.carousel-wrapper');
  if (carousel && !carousel.classList.contains('reveal-scale')) {
    carousel.classList.add('reveal-scale');
  }

  // Footer
  const footer = document.querySelector('.footer');
  if (footer && !footer.classList.contains('reveal')) {
    footer.classList.add('reveal');
  }

  // Normativas
  const normativaCards = document.querySelectorAll('.normativa-card, .policy-card, .rule-item, .decorator-card');
  normativaCards.forEach((card, index) => {
    if (!card.classList.contains('reveal-scale')) {
      card.classList.add('reveal-scale', 'hover-lift', `reveal-delay-${(index % 4) + 1}`);
    }
  });

  const normativaSections = document.querySelectorAll('.normativas-section, .normativas-hero, .quick-nav, .timeline, .info-box');
  normativaSections.forEach(section => {
    if (!section.classList.contains('reveal')) {
      section.classList.add('reveal');
    }
  });

  const timelineItems = document.querySelectorAll('.timeline-item, .service-item');
  timelineItems.forEach((item, index) => {
    if (!item.classList.contains('reveal-left')) {
      item.classList.add('reveal-left', `reveal-delay-${(index % 4) + 1}`);
    }
  });

  // Botones
  const buttons = document.querySelectorAll('.reserva-btn, .btn-submit, .cta-button, .quick-nav-item');
  buttons.forEach(btn => {
    if (!btn.classList.contains('btn-ripple')) {
      btn.classList.add('btn-ripple', 'hover-glow');
    }
  });

  // Iconos
  const iconContainers = document.querySelectorAll('.social-icon, .beneficio-icon, .rule-icon');
  iconContainers.forEach(icon => {
    if (!icon.classList.contains('icon-bounce')) {
      icon.classList.add('icon-bounce');
    }
  });
}

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


  addAnimationClasses();

  initScrollReveal();

  initParallax();

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

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== 'undefined' && typeof barba !== 'undefined') {

    gsap.set(".transition-overlay", { y: "100%" });

    barba.init({
      sync: true,
      preventRunning: true,
      prevent: ({ el }) => {
        if (el.href && el.href.includes('#')) {
          const url = new URL(el.href);
          const currentPath = window.location.pathname.split('/').pop() || 'index.html';
          const targetPath = url.pathname.split('/').pop() || 'index.html';
          if (currentPath === targetPath) {
            return true;
          }
        }
        return false;
      },
      transitions: [{
        name: 'spectacular-slide',

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

        // Cortina sube y tapa con efecto de onda
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

        //Reiniciar scripts y animar elementos
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