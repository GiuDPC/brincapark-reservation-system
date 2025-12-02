# 🎢 BRINCAPARK - Sistema de Gestión de Reservas

<div align="center">

![BRINCAPARK Logo](frontend/assets/img/Logo.png)

**Sistema completo de gestión de reservas para parques de diversiones**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-v5.1-blue.svg)](https://expressjs.com/)

[Características](#-características) •
[Demo](#-demo) •
[Instalación](#-instalación-rápida) •
[Documentación](#-documentación) •
[Contribuir](#-contribuir)

</div>

---

## Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías-utilizadas)
- [Instalación Rápida](#-instalación-rápida)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Configuración](#-configuración)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## Acerca del Proyecto

**BRINCAPARK** es una plataforma web integral diseñada para gestionar reservas de parques de diversiones. El sistema permite a los usuarios realizar reservas de tickets y paquetes de fiestas de manera sencilla, mientras proporciona a los administradores herramientas completas para gestionar reservas, visualizar estadísticas en tiempo real y configurar el sistema.

### ¿Por qué BRINCAPARK?

- **Gestión Centralizada**: Administra múltiples parques desde un solo panel
- **Analytics en Tiempo Real**: Visualiza estadísticas, ingresos y tendencias
- **Multi-Moneda**: Soporte para USD y Bolívares con conversión automática
- **100% Responsive**: Funciona perfectamente en móviles, tablets y desktop
- **Seguro**: Autenticación administrativa y validación de datos
- **Rápido y Eficiente**: Arquitectura optimizada con MongoDB y Express

---

## Características

### Para Usuarios (Público)

- **Reserva de Tickets Individuales**
  - 15 minutos, 30 minutos, 60 minutos
  - Full Day y Combo especial
- **Paquetes de Fiestas**
  - Mini (30 personas), Mediano (60 personas), Full (80 personas)
  - Precios diferenciados entre semana y fin de semana
- **Selección de Parque**
  - Maracaibo, Caracas, Punto Fijo
- **Formulario Intuitivo**
  - Validación en tiempo real
  - Verificación de disponibilidad de horarios
  - Confirmación inmediata
- **Galería de Imágenes**
  - Carrusel automático con imágenes del parque
- **Información Completa**
  - Horarios, normativas y precios

### Para Administradores

- **Panel Administrativo Completo**
  - Dashboard con métricas en tiempo real
  - Visualización de estadísticas clave
- **Analytics Avanzados**
  - Gráficas de distribución por parque
  - Ingresos totales y promedios
  - Día más popular
  - Paquete más vendido
  - Análisis mensual
- **Gestión de Reservas**
  - Aprobar, cancelar o editar reservas
  - Búsqueda y filtrado avanzado
  - Exportación a PDF y Excel
- **Sistema de Notificaciones**
  - Alertas de reservas pendientes
  - Actualización automática cada 30 segundos
- **Calendario Visual**
  - Vista mensual de reservas
  - Navegación intuitiva
- **Configuración del Sistema**
  - Cambio de moneda (USD/Bs)
  - Actualización de tasa BCV
  - Modificación de precios de tickets y paquetes
- **Reportes y Exportación**
  - Generación de reportes en PDF
  - Exportación de datos a Excel
  - Métricas avanzadas y comparativas

---

## Tecnologías Utilizadas

### Frontend

- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive con variables CSS
- **JavaScript (ES6+)** - Lógica del cliente (Vanilla JS)
- **Chart.js** - Visualización de datos y gráficas
- **SweetAlert2** - Alertas elegantes y modales
- **jsPDF & jsPDF-AutoTable** - Generación de PDFs
- **SheetJS (xlsx)** - Exportación a Excel

### Backend

- **Node.js** - Entorno de ejecución
- **Express.js v5.1** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **CORS** - Manejo de peticiones cross-origin
- **dotenv** - Gestión de variables de entorno

### Herramientas de Desarrollo

- **Nodemon** - Auto-restart del servidor en desarrollo
- **pnpm** - Gestor de paquetes rápido y eficiente

---

## Instalación Rápida

### Prerequisitos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 o superior)
- [pnpm](https://pnpm.io/) (opcional, puedes usar npm)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/GiuDPC/Parque-sistema-integral-V.git
cd Parque-sistema-integral-V
```

### Paso 2: Configurar el Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
pnpm install
# o con npm: npm install

# Crear archivo .env
cp .env.example .env
# Edita .env y configura tus variables (ver sección Configuración)

# Iniciar el servidor
pnpm dev
# o con npm: npm run dev
```

El servidor estará corriendo en `http://localhost:4000`

### Paso 3: Configurar el Frontend

```bash
# En otra terminal, navegar a la carpeta del frontend
cd frontend

# Iniciar servidor HTTP (elige uno)
npx http-server -p 8080 -c-1
# o con Python: python -m http.server 8080
# o con PHP: php -S localhost:8080
```

La aplicación estará disponible en `http://localhost:8080`

### Paso 4: Acceder al Sistema

- **Página Pública**: `http://localhost:8080`
- **Panel Admin**: `http://localhost:8080/admin.html`
- **Normativas**: `http://localhost:8080/normativas.html`

---

## Uso

### Realizar una Reserva (Usuario)

1. Abre `http://localhost:8080`
2. Navega a la sección "Reservar"
3. Completa el formulario con tus datos:
   - Nombre completo
   - Correo electrónico
   - Teléfono
   - Fecha del servicio
   - Selecciona el parque
   - Elige el horario disponible
   - Selecciona el paquete
   - Tipo de evento
4. Haz clic en "Enviar Reserva"
5. Recibirás una confirmación inmediata

### Gestionar Reservas (Administrador)

1. Abre `http://localhost:8080/admin.html`
2. Ingresa el código de acceso (configurado en `.env` como `ADMIN_SECRET`)
3. En el dashboard verás:
   - Estadísticas generales
   - Gráficas de distribución
   - Calendario de reservas
4. Ve a "Gestión de Reservas" para:
   - Ver todas las reservas
   - Filtrar por estado, parque o fecha
   - Aprobar o cancelar reservas
   - Editar detalles de reservas
5. Ve a "Reportes" para:
   - Exportar datos a PDF o Excel
   - Ver métricas avanzadas
6. Ve a "Configuración" para:
   - Cambiar moneda y tasa BCV
   - Actualizar precios

---

## Estructura del Proyecto

```
BRINCAPARK/
├── backend/                    # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/            # Configuración de BD
│   │   │   └── db.js          # Conexión a MongoDB
│   │   ├── middleware/        # Middlewares personalizados
│   │   │   └── adminAuth.js   # Autenticación admin
│   │   ├── models/            # Modelos de Mongoose
│   │   │   ├── Reservation.js # Modelo de Reserva
│   │   │   ├── Config.js      # Modelo de Configuración
│   │   │   └── index.js       # Exportador de modelos
│   │   ├── routes/            # Rutas de la API
│   │   │   ├── reservations.js # Rutas de reservas
│   │   │   ├── admin.js       # Rutas administrativas
│   │   │   └── config.js      # Rutas de configuración
│   │   └── index.js           # Punto de entrada del servidor
│   ├── .env.example           # Ejemplo de variables de entorno
│   └── package.json           # Dependencias del backend
│
├── frontend/                   # Cliente web
│   ├── assets/
│   │   ├── css/               # Hojas de estilo
│   │   │   ├── index.css      # Estilos página principal
│   │   │   ├── admin.css      # Estilos panel admin
│   │   │   ├── admin-mejoras.css
│   │   │   ├── admin-funcionalidades.css
│   │   │   ├── admin-analytics.css
│   │   │   ├── normativas.css
│   │   │   └── styles.css     # Estilos globales
│   │   ├── js/                # Scripts JavaScript
│   │   │   ├── main.js        # Lógica página principal
│   │   │   ├── admin.js       # Lógica panel admin
│   │   │   ├── admin-funcionalidades.js
│   │   │   ├── admin-analytics.js
│   │   │   ├── api.js         # Cliente API
│   │   │   └── pricing.js     # Cálculos de precios
│   │   ├── img/               # Imágenes y recursos
│   │   └── fonts/             # Fuentes personalizadas
│   ├── index.html             # Página principal
│   ├── admin.html             # Panel administrativo
│   └── normativas.html        # Página de normativas
│
├── .gitignore                 # Archivos ignorados por Git
├── README.md                  # Este archivo
└── DOCUMENTACION_TECNICA.md   # Documentación técnica detallada
```

---

## API Endpoints

### Endpoints Públicos

#### Crear Reserva
```http
POST /api/reservations
Content-Type: application/json

{
  "nombreCompleto": "Juan Pérez",
  "correo": "juan@example.com",
  "telefono": "+58 414-1234567",
  "paquete": "mini",
  "fechaServicio": "2025-12-25",
  "horaReservacion": "10am-1pm",
  "parque": "Maracaibo",
  "estadoUbicacion": "Zulia",
  "tipoEvento": "Cumpleaños"
}
```

#### Listar Reservas
```http
GET /api/reservations
```

#### Obtener Horarios Ocupados
```http
GET /api/reservations/horarios-ocupados?fechaServicio=2025-12-25&parque=Maracaibo
```

### Endpoints Administrativos

Requieren header: `x-admin-secret: tu_clave_secreta`

#### Obtener Estadísticas
```http
GET /api/reservations/analytics/stats
x-admin-secret: tu_clave_secreta
```

#### Actualizar Reserva
```http
PATCH /api/admin/reservations/:id
x-admin-secret: tu_clave_secreta
Content-Type: application/json

{
  "estadoReserva": "aprobado"
}
```

#### Eliminar Reserva
```http
DELETE /api/admin/reservations/:id
x-admin-secret: tu_clave_secreta
```

Para documentación completa de la API, consulta [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md).

---

## Configuración

### Variables de Entorno (Backend)

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Puerto del servidor
PORT=4000

# URL de conexión a MongoDB
# Desarrollo local:
MONGO_URI=mongodb://localhost:27017/brincapark

# Producción (MongoDB Atlas):
# MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/brincapark

# Clave secreta para acceso administrativo
# IMPORTANTE: Usa una clave larga y segura en producción
ADMIN_SECRET=tu_clave_secreta_super_segura_aqui
```

### Configuración de Precios

Los precios se pueden configurar desde el panel administrativo en la sección "Configuración", o directamente en la base de datos. Los valores por defecto son:

**Tickets:**
- 15 min: $6
- 30 min: $9
- 60 min: $10
- Full Day: $11
- Combo: $13

**Paquetes (Lunes-Jueves / Viernes-Domingo):**
- Mini: $150 / $180
- Mediano: $200 / $230
- Full: $250 / $280

---

## 📸 Capturas de Pantalla

### Página Principal
![Página Principal](docs/screenshots/home.png)

### Panel Administrativo
![Dashboard Admin](docs/screenshots/admin-dashboard.png)

### Gestión de Reservas
![Gestión de Reservas](docs/screenshots/reservations.png)

### Analytics y Reportes
![Analytics](docs/screenshots/analytics.png)

---

## Roadmap

### Versión 1.0 (Actual)
- [x] Sistema de reservas público
- [x] Panel administrativo completo
- [x] Analytics y reportes
- [x] Exportación PDF/Excel
- [x] Multi-moneda (USD/Bs)
- [x] Diseño responsive

### Versión 1.1 (Próximamente)
- [ ] Sistema de emails automáticos
- [ ] Notificaciones por WhatsApp
- [ ] Recordatorios de reservas
- [ ] Integración con calendario (Google Calendar)

### Versión 2.0 (Futuro)
- [ ] Integración de pagos (Stripe/PayPal)
- [ ] Sistema de cupones y descuentos
- [ ] Autenticación multi-usuario
- [ ] Roles y permisos
- [ ] App móvil nativa (React Native)
- [ ] Sistema de reviews y calificaciones

---

## Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar BRINCAPARK:

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Guías de Contribución

- Sigue el estilo de código existente
- Agrega comentarios claros y descriptivos
- Actualiza la documentación si es necesario
- Asegúrate de que todo funcione antes de hacer PR

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## Autor

**Giuseppe**

- GitHub: [@GiuDPC](https://github.com/GiuDPC)
- Proyecto: [BRINCAPARK](https://github.com/GiuDPC/Parque-sistema-integral-V)

---

## Agradecimientos

- [Chart.js](https://www.chartjs.org/) - Gráficas hermosas y responsivas
- [SweetAlert2](https://sweetalert2.github.io/) - Alertas modernas
- [MongoDB](https://www.mongodb.com/) - Base de datos flexible
- [Express.js](https://expressjs.com/) - Framework web minimalista

---

## Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la [documentación técnica](DOCUMENTACION_TECNICA.md)
2. Abre un [Issue](https://github.com/GiuDPC/Parque-sistema-integral-V/issues)
3. Contacta al autor

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub ⭐**

Hecho con ❤️ por Giuseppe

</div>
