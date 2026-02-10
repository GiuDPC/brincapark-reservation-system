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
  let touchStartX = 0, touchEndX = 0;

  const wrapper = container.closest('.carousel-wrapper');
  let indicators = wrapper?.querySelector('.carousel-indicators')?.querySelectorAll('.indicator, .carousel-indicator');
  indicators?.forEach((indicator, index) => indicator.addEventListener('click', () => goToSlide(index)));

  function goToSlide(index) {
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    items[currentIndex].classList.remove('active');
    if (indicators) indicators[currentIndex].classList.remove('active');
    currentIndex = index;
    items[currentIndex].classList.add('active');
    if (indicators) indicators[currentIndex].classList.add('active');
  }

  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide() { goToSlide(currentIndex - 1); }
  function startAutoPlay() { stopAutoPlay(); autoPlayInterval = setInterval(nextSlide, 4000); }
  function stopAutoPlay() { if (autoPlayInterval) { clearInterval(autoPlayInterval); autoPlayInterval = null; } }

  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });

  container.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; stopAutoPlay(); }, { passive: true });
  container.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); startAutoPlay(); }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  }

  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);
  startAutoPlay();
  items[0].classList.add('active');
}

function initFormulario() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  const parqueEstadoMap = { 'Maracaibo': 'Zulia', 'Caracas': 'Distrito Capital', 'Punto Fijo': 'Falcón' };
  const sanitizeInput = (str) => { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; };
  const validations = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    phone: /^[0-9]{11}$/,
    name: /^[a-zA-ZÀ-ÿ\s]{3,50}$/
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    const nameVal = form.querySelector('#name').value.trim();
    const emailVal = form.querySelector('#email').value.trim();
    const phoneVal = form.querySelector('#phone').value.trim();
    const packageVal = form.querySelector('#package').value;
    const dateVal = form.querySelector('#date').value;
    const parqueVal = form.querySelector('#parque').value;
    const horaVal = form.querySelector('#horaReservacion').value;
    const tipoVal = form.querySelector('#tipoEvento').value;

    if (!validations.name.test(nameVal)) { Swal.fire({ icon: 'warning', title: 'Nombre inválido', confirmButtonColor: '#4b0082' }); return; }
    if (!validations.email.test(emailVal)) { Swal.fire({ icon: 'warning', title: 'Correo inválido', confirmButtonColor: '#4b0082' }); return; }
    if (!validations.phone.test(phoneVal)) { Swal.fire({ icon: 'warning', title: 'Teléfono inválido', confirmButtonColor: '#4b0082' }); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      await crearReserva({
        nombreCompleto: sanitizeInput(nameVal), correo: sanitizeInput(emailVal), telefono: sanitizeInput(phoneVal),
        paquete: packageVal, fechaServicio: dateVal, parque: parqueVal, horaReservacion: horaVal,
        tipoEvento: tipoVal, estadoUbicacion: parqueEstadoMap[parqueVal] || 'Desconocido'
      });
      Swal.fire({ icon: 'success', title: '¡Reserva enviada!', text: 'Te contactaremos pronto.', confirmButtonColor: '#4b0082' });
      form.reset();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'No se pudo enviar.', confirmButtonColor: '#4b0082' });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

function initParallax() {
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');
  if (!hero) return;

  let ticking = false;
  const isMobile = window.innerWidth < 768;
  const parallaxFactor = isMobile ? 0.15 : 0.3;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    if (scrolled <= hero.offsetHeight && heroImage) {
      heroImage.style.transform = `translateY(${scrolled * parallaxFactor}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); obs.unobserve(entry.target); }
    });
  }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));
}

function addAnimationClasses() {
  document.querySelector('.hero-content')?.classList.add('reveal-left');
  document.querySelector('.hero-image')?.classList.add('reveal-right');
  document.querySelectorAll('.section-title').forEach(t => t.classList.add('reveal'));
  document.querySelectorAll('.ticket-card').forEach((c, i) => c.classList.add('reveal-scale', 'hover-lift', `reveal-delay-${(i % 4) + 1}`));
  document.querySelectorAll('.paquete-card').forEach((c, i) => c.classList.add('reveal-scale', 'hover-lift', `reveal-delay-${(i % 4) + 1}`));
  document.querySelectorAll('.beneficios-container, .beneficios-section').forEach(b => b.classList.add('reveal'));
  document.querySelector('.formulario-section, .formulario-content')?.classList.add('reveal');
  document.querySelector('.galeria-section')?.classList.add('reveal');
  document.querySelector('.carousel-wrapper')?.classList.add('reveal-scale');
  document.querySelector('.footer')?.classList.add('reveal');
  document.querySelectorAll('.normativa-card, .policy-card, .rule-item').forEach((c, i) => c.classList.add('reveal-scale', 'hover-lift', `reveal-delay-${(i % 4) + 1}`));
  document.querySelectorAll('.reserva-btn, .btn-submit, .cta-button').forEach(btn => btn.classList.add('btn-ripple', 'hover-glow'));
  document.querySelectorAll('.social-icon, .beneficio-icon').forEach(icon => icon.classList.add('icon-bounce'));
}

function initApp() {
  const body = document.body;
  if (window.menuListener) body.removeEventListener('click', window.menuListener);

  window.menuListener = function(e) {
    const btn = e.target.closest('.menu-toggle');
    const menu = document.querySelector('.navbar-menu');
    const link = e.target.closest('.navbar-menu a');
    const toggleIcon = document.querySelector('.menu-toggle');
    if (!menu) return;
    if (btn) { e.stopPropagation(); menu.classList.toggle('active'); toggleIcon?.classList.toggle('is-active'); }
    if (link) { menu.classList.remove('active'); toggleIcon?.classList.remove('is-active'); }
  };
  document.addEventListener('click', window.menuListener);

  const navbar = document.querySelector(".navbar");
  if (navbar) window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 50));

  if (document.getElementById("gallery-carousel")) initCarousel();
  if (document.getElementById("reservation-form")) initFormulario();
  if (typeof inicializarPreciosDinamicos === 'function') inicializarPreciosDinamicos();

  addAnimationClasses();
  initScrollReveal();
  initParallax();
  animarSeccionesAlCargar();
}

function animarSeccionesAlCargar() {
  if (typeof gsap === 'undefined') return;
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image');

  if (heroContent && heroImage) {
    gsap.fromTo(heroContent, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: "power2.out", delay: 0.2 });
    gsap.fromTo(heroImage, { opacity: 0, x: 50, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.4 });
  }

  const ticketCards = document.querySelectorAll('.ticket-card');
  if (ticketCards.length > 0) gsap.fromTo(ticketCards, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)", delay: 0.3 });

  const paqueteCards = document.querySelectorAll('.paquete-card');
  if (paqueteCards.length > 0) gsap.fromTo(paqueteCards, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 0.3 });
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== 'undefined' && typeof barba !== 'undefined') {
    gsap.set(".transition-overlay", { y: "100%" });

    barba.init({
      sync: true, preventRunning: true,
      prevent: ({ el }) => {
        if (el.href?.includes('#')) {
          const currentPath = window.location.pathname.split('/').pop() || 'index.html';
          const targetPath = new URL(el.href).pathname.split('/').pop() || 'index.html';
          return currentPath === targetPath;
        }
        return false;
      },
      transitions: [{
        name: 'spectacular-slide',
        beforeLeave(data) {
          const cards = data.current.container.querySelectorAll('.ticket-card, .paquete-card');
          if (cards.length > 0) gsap.to(cards, { opacity: 0, y: -20, scale: 0.95, duration: 0.3, stagger: 0.05 });
        },
        leave(data) {
          const tl = gsap.timeline();
          tl.to(data.current.container, { opacity: 0.3, duration: 0.3, ease: "power2.in" }, 0);
          tl.to(".transition-overlay", { y: "0%", duration: 0.5, ease: "power3.inOut" }, 0.1);
          return tl;
        },
        enter(data) {
          window.scrollTo(0, 0);
          const tl = gsap.timeline();
          gsap.set(data.next.container, { opacity: 0 });
          tl.to(".transition-overlay", { y: "-100%", duration: 0.6, ease: "power3.inOut", delay: 0.1 });
          tl.to(data.next.container, { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.3");
          return tl;
        },
        afterEnter() { initApp(); }
      }],
      views: [
        { namespace: 'home', afterEnter() { animarSeccionesAlCargar(); } },
        { namespace: 'normativas', afterEnter() {
          const cards = document.querySelectorAll('.normativa-card, .policy-card');
          if (cards.length > 0) gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 });
        }}
      ]
    });
  }
  initApp();
});