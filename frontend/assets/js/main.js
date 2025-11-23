// main.js - Lógica de la landing page

document.addEventListener("DOMContentLoaded", () => {
  console.log("BRINCAPARK Frontend cargado");

  // FORMULARIO DE RESREVAS PUBLICO (LOGICA)
  const form = document.getElementById("reservation-form");
  const horaSelect = document.getElementById("horaReservacion");
  const parqueSelect = document.getElementById("parque");

  // Función para mostrar mensajes con SweetAlert2
  function mostrarMensaje(mensaje, tipo) {
    Swal.fire({
      text: mensaje,
      icon: tipo,
      confirmButtonText: "OK",
      confirmButtonColor: "#7C3AED",
      timer: tipo === "success" ? 2500 : undefined,
    });
  }

  // Actualizar horarios ocupados al cambiar fecha o parque
  async function actualizarHorariosOcupados() {
    const fecha = form.querySelector("#date").value;
    const parque = parqueSelect.value;
    if (!fecha || !parque) {
      horaSelect.querySelectorAll("option").forEach((opt) => {
        opt.disabled = false;
        opt.textContent = opt.textContent.replace(/\s*\(Ocupado\)/, "");
      });
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:4000/api/reservations/horarios-ocupados?fechaServicio=${fecha}&parque=${parque}`
      );
      const data = await res.json();
      const ocupados = data.horariosOcupados || [];
      horaSelect.querySelectorAll("option").forEach((opt) => {
        if (ocupados.includes(opt.value) && opt.value) {
          opt.disabled = true;
          opt.textContent =
            opt.textContent.replace(/\s*\(Ocupado\)/, "") + " (Ocupado)";
        } else if (opt.value) {
          opt.disabled = false;
          opt.textContent = opt.textContent.replace(/\s*\(Ocupado\)/, "");
        }
      });
    } catch (err) {
      console.error("Error consultando horarios ocupados:", err);
    }
  }

  if (form) {
    // Event listeners para actualizar horarios
    form
      .querySelector("#date")
      .addEventListener("change", actualizarHorariosOcupados);
    parqueSelect.addEventListener("change", actualizarHorariosOcupados);

    // Manejar envío del formulario
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Obtener datos del formulario
      const formData = new FormData(form);
      const datos = {
        nombreCompleto: formData.get("name"),
        correo: formData.get("email"),
        telefono: formData.get("phone"),
        fechaServicio: formData.get("date"),
        paquete: formData.get("package"),
        horaReservacion: formData.get("horaReservacion"),
        parque: formData.get("parque"),
        estadoUbicacion: "Venezuela",
        tipoEvento: formData.get("tipoEvento") || formData.get("package"),
      };

      // Validación básica
      if (
        !datos.nombreCompleto ||
        !datos.correo ||
        !datos.telefono ||
        !datos.fechaServicio ||
        !datos.paquete ||
        !datos.horaReservacion ||
        !datos.parque
      ) {
        mostrarMensaje(
          "Por favor completa todos los campos obligatorios",
          "error"
        );
        return;
      }

      // Deshabilitar botón mientras se envía
      const submitBtn = form.querySelector('button[type="submit"]');
      const textoOriginal = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      try {
        // Enviar al backend
        const resultado = await crearReserva(datos);
        console.log("Reserva creada:", resultado);
        mostrarMensaje(
          "¡Reserva enviada con éxito! Nos pondremos en contacto contigo pronto.",
          "success"
        );
        form.reset();
        actualizarHorariosOcupados();
      } catch (error) {
        console.error("Error al crear reserva:", error);
        mostrarMensaje(
          "Hubo un error al enviar tu reserva. Por favor intenta nuevamente o contáctanos directamente.",
          "error"
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = textoOriginal;
      }
    });
  }

  // EFECTO SUAVA DE SCROLL DE NAVBAR PARA MEJORAR SU APARENCIA AL BAJAR LA PAGINA
  const navbar = document.querySelector(".navbar");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Agregar clase 'scrolled' cuando se hace scroll más de 50px
    if (scrollTop > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    lastScrollTop = scrollTop;
  });

  // CARRUSEL DE GALERIA DEL PARQUE
  const carouselItems = document.querySelectorAll(".carousel-item");
  const indicators = document.querySelectorAll(".indicator");
  const prevBtn = document.getElementById("carousel-prev");
  const nextBtn = document.getElementById("carousel-next");
  let currentSlide = 0;
  let autoPlayInterval;

  function showSlide(index) {
    // Remover active de todos
    carouselItems.forEach((item) => item.classList.remove("active"));
    indicators.forEach((ind) => ind.classList.remove("active"));

    // Agregar active al slide actual
    if (carouselItems[index]) {
      carouselItems[index].classList.add("active");
      indicators[index].classList.add("active");
      currentSlide = index;
    }
  }

  function nextSlide() {
    const next = (currentSlide + 1) % carouselItems.length;
    showSlide(next);
  }

  function prevSlide() {
    const prev =
      (currentSlide - 1 + carouselItems.length) % carouselItems.length;
    showSlide(prev);
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  // Indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index);
      resetAutoPlay();
    });
  });

  // Auto-play
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // Cambiar cada 5 segundos
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  // Iniciar auto-play para que se muestre si hay carrusel
  if (carouselItems.length > 0) {
    startAutoPlay();

    // Pausar en hover
    const carouselContainer = document.getElementById("gallery-carousel");
    if (carouselContainer) {
      carouselContainer.addEventListener("mouseenter", () => {
        clearInterval(autoPlayInterval);
      });

      carouselContainer.addEventListener("mouseleave", () => {
        startAutoPlay();
      });
    }
  }

  // SMOOTH SCROLL PARA ENLACES INTERNOS
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});
