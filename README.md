# BRINCAPARK - Sistema de Gestion de Reservas

<div align="center">

![BRINCAPARK Logo](frontend/assets/img/Logo.png)

**Sistema completo de gestion de reservas para parques de diversiones**

[![Estado](https://img.shields.io/badge/Estado-Produccion-success)](https://brincapark-reservation-system.vercel.app/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Express](https://img.shields.io/badge/Express-v5.1-blue.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-6E9F18.svg)](https://vitest.dev/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF.svg)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Demo en Vivo](https://brincapark-reservation-system.vercel.app/) |
[Documentacion Tecnica](DOCUMENTACION_TECNICA.md)

</div>

---

## Tabla de Contenidos

- [Acerca del Proyecto](#acerca-del-proyecto)
- [Demo en Vivo](#demo-en-vivo)
- [Arquitectura](#arquitectura)
- [Tecnologias Utinlizadas](#tecologias-utilizadas)
- [Caracteristicas](#caracteristicas)
- [Instalacion Local](#instalacion-local)
- [Instalacion con Docker](#instalacion-con-docker)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Despliegue en Produccion](#despliegue-en-produccion)
- [API Endpoints](#api-endpoints)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuracion](#configuracion)
- [Capturas de Pantalla](#capturas-de-pantalla)
- [Roadmap](#roadmap)
- [Licencia](#licencia)
- [Autor](#autor)

---

## Acerca del Proyecto

Este sistema nace como una solucion integral para digitalizar la gestion de un parque de atracciones que operaba manualmente. El software resuelve problemas criticos como la duplicidad de reservas, automatiza el calculo de ingresos diarios y ofrece metricas en tiempo real para la toma de decisiones, transformando procesos manuales en un flujo digital eficiente.

BRINCAPARK es una plataforma web integral que permite a los usuarios realizar reservas de tickets y paquetes de fiestas de manera sencilla, mientras proporciona a los administradores herramientas completas para gestionar reservas, visualizar estadisticas en tiempo real y configurar el sistema.

### Puntos Destacados

- **Gestion Centralizada**: Administra multiples parques desde un solo panel
- **Analytics en Tiempo Real**: Visualiza estadisticas, ingresos y tendencias
- **Multi-Moneda**: Soporte para USD y Bolivares con conversion automatica via tasa BCV
- **100% Responsive**: Funciona en moviles, tablets y desktop
- **Precios Dinamicos**: Sistema de cache local para carga instantanea de precios
- **Transiciones Fluidas**: Implementacion de Barba.js con GSAP para navegacion suave

---

## Demo en Vivo

| Componente | URL | Servicio |
|------------|-----|----------|
| **Frontend** | [brincapark-reservation-system.vercel.app](https://brincapark-reservation-system.vercel.app/) | Vercel |
| **Backend API** | brincapark-api.onrender.com | Render |
| **Base de Datos** | MongoDB Atlas | MongoDB Cloud |

### Acceso al Panel Administrativo

1. Navegar a `/admin.html`
2. Ingresar el codigo de acceso configurado en las variables de entorno

---

## Arquitectura

```
                    +------------------+
                    |    Cliente       |
                    |   (Navegador)    |
                    +--------+---------+
                             |
                             | HTTPS
                             v
+----------------------------+----------------------------+
|                            |                            |
|     +------------------+   |   +------------------+     |
|     |    Frontend      |   |   |    Backend       |     |
|     |    (Vercel)      |   |   |    (Render)      |     |
|     |                  |   |   |                  |     |
|     |  - HTML/CSS/JS   |   |   |  - Node.js       |     |
|     |  - Barba.js      |   |   |  - Express.js    |     |
|     |  - GSAP          |   |   |  - Mongoose      |     |
|     |  - Chart.js      |   |   |  - REST API      |     |
|     +--------+---------+   |   +--------+---------+     |
|              |             |            |               |
|              +-------------+------------+               |
|                            |                            |
+----------------------------+----------------------------+
                             |
                             | MongoDB Driver
                             v
                    +------------------+
                    |  MongoDB Atlas   |
                    |  (Base de Datos) |
                    +------------------+
```

---

## Tecnologias Utilizadas

### Frontend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| HTML5 | - | Estructura semantica |
| CSS3 | - | Diseño responsive con variables CSS |
| JavaScript | ES6+ | Logica del cliente (Vanilla JS) |
| Barba.js | 2.x | Transiciones de pagina fluidas |
| GSAP | 3.12 | Animaciones avanzadas |
| Chart.js | 4.x | Visualizacion de datos y graficas |
| SweetAlert2 | 11.x | Alertas elegantes y modales |
| jsPDF | 2.x | Generacion de PDFs |
| SheetJS | - | Exportacion a Excel |

### Backend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| Node.js | 14+ | Entorno de ejecucion |
| Express.js | 5.1 | Framework web |
| MongoDB | Atlas | Base de datos NoSQL |
| Mongoose | 8.x | ODM para MongoDB |
| CORS | - | Manejo de peticiones cross-origin |
| dotenv | - | Gestion de variables de entorno |

### Infraestructura

| Servicio | Proposito |
|----------|-----------|
| Vercel | Hosting del frontend |
| Render | Hosting del backend |
| MongoDB Atlas | Base de datos en la nube |
| pnpm | Gestor de paquetes |
| Docker | Contenedorizacion |
| Vitest | Testing framework |
| GitHub Actions | CI/CD |

---

## Caracteristicas

### Para Usuarios (Publico)

- Reserva de Tickets Individuales (15 min, 30 min, 60 min, Full Day, Combo)
- Paquetes de Fiestas (Mini 30 personas, Mediano 60 personas, Full 80 personas)
- Seleccion de Parque (Maracaibo, Caracas, Punto Fijo)
- Verificacion de disponibilidad de horarios en tiempo real
- Galeria de imagenes con carrusel automatico
- Pagina de normativas y politicas

### Para Administradores

- Dashboard con metricas en tiempo real
- Graficas de distribucion por parque (Chart.js)
- Ingresos totales y promedios con analisis mensual
- Gestion completa de reservas (aprobar, cancelar, editar)
- Busqueda y filtrado avanzado
- Exportacion a PDF y Excel
- Sistema de notificaciones de reservas pendientes
- Calendario visual con vista mensual
- Configuracion de moneda (USD/Bs) y tasa BCV
- Actualizacion dinamica de precios

---

## Instalacion Local

### Prerequisitos

- Node.js v14 o superior
- MongoDB v4.4 o superior (local) o cuenta en MongoDB Atlas
- pnpm (recomendado) o npm

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/GiuDPC/brincapark-reservation-system.git
cd brincapark-reservation-system
```

### Paso 2: Configurar el Backend

```bash
cd backend

# Instalar dependencias
pnpm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env con tu configuracion (ver seccion Configuracion)

# Iniciar servidor de desarrollo
pnpm dev
```

El servidor estara corriendo en `http://localhost:4000`

### Paso 3: Configurar el Frontend

```bash
cd frontend

# Iniciar servidor HTTP
npx http-server -p 8080 -c-1
```

La aplicacion estara disponible en `http://localhost:8080`

### Paso 4: Verificar Instalacion

- Pagina Publica: `http://localhost:8080`
- Panel Admin: `http://localhost:8080/admin.html`
- Normativas: `http://localhost:8080/normativas.html`

---

## Instalacion con Docker

Si prefieres usar Docker, puedes ejecutar el backend con un solo comando:

### Prerequisitos

- Docker Desktop instalado
- Docker Compose

### Paso 1: Configurar variables de entorno

```bash
cd backend
cp .env.example .env
# Editar .env con tu configuracion
```

### Paso 2: Ejecutar con Docker Compose

Desde la raiz del proyecto:

```bash
docker compose up
```

El servidor estara corriendo en `http://localhost:4000`

### Comandos Docker utiles

| Comando | Descripcion |
|---------|-------------|
| `docker compose up` | Inicia el contenedor |
| `docker compose down` | Detiene el contenedor |
| `docker compose build --no-cache` | Reconstruye la imagen |
| `docker compose logs -f` | Ver logs en tiempo real |

---

## Testing

El proyecto incluye tests automatizados con Vitest y Supertest.

### Ejecutar tests

```bash
cd backend

# Modo watch (desarrollo)
pnpm test

# Ejecutar una vez (CI/CD)
pnpm test:run
```

### Cobertura de tests

| Tipo | Descripcion |
|------|-------------|
| Tests unitarios | Verificacion de logica basica |
| Tests de API | Verificacion de endpoints REST |
| Tests de autenticacion | Verificacion de acceso admin |

### Resultado esperado

```
 Test Files  2 passed (2)
      Tests  9 passed (9)
   Duration  1.21s
```

---

## CI/CD

El proyecto utiliza GitHub Actions para integracion y despliegue continuo.

### Workflow

Cada push a `main` o `master` ejecuta automaticamente:

1. Checkout del codigo
2. Instalacion de Node.js 20
3. Instalacion de dependencias con pnpm
4. Ejecucion de tests

### Configuracion

El workflow se encuentra en `.github/workflows/ci.yml`

### Secrets requeridos

Configurar en GitHub Settings > Secrets:

| Secret | Descripcion |
|--------|-------------|
| `MONGO_URI` | URL de conexion a MongoDB |
| `ADMIN_SECRET` | Clave de acceso administrativo |
| `JWT_SECRET` | Clave para tokens JWT |

---

## Despliegue en Produccion

### Frontend (Vercel)

1. Conectar repositorio a Vercel
2. Configurar directorio raiz como `frontend`
3. No se requieren comandos de build (HTML/CSS/JS estatico)
4. Desplegar

### Backend (Render)

1. Crear nuevo Web Service en Render
2. Conectar repositorio
3. Configurar:
   - Root Directory: `backend`
   - Build Command: `pnpm install`
   - Start Command: `node src/index.js`
4. Agregar variables de entorno:
   - `MONGO_URI`: URL de conexion a MongoDB Atlas
   - `ADMIN_SECRET`: Clave de acceso administrativo
   - `PORT`: 4000 (u otro puerto disponible)
5. Desplegar

### Base de Datos (MongoDB Atlas)

1. Crear cluster gratuito en MongoDB Atlas
2. Configurar usuario y contrasena de base de datos
3. Agregar IP de Render a la whitelist (o permitir acceso desde cualquier IP)
4. Obtener connection string y agregarlo a las variables de entorno de Render

---

## API Endpoints

### Endpoints Publicos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/reservations` | Crear nueva reserva |
| GET | `/api/reservations` | Listar reservas |
| GET | `/api/reservations/horarios-ocupados` | Obtener horarios ocupados |
| GET | `/api/config/precios` | Obtener precios actuales |

### Endpoints Administrativos

Requieren header: `x-admin-secret: [ADMIN_SECRET]`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/reservations/analytics/stats` | Obtener estadisticas |
| PATCH | `/api/admin/reservations/:id` | Actualizar reserva |
| DELETE | `/api/admin/reservations/:id` | Eliminar reserva |
| PUT | `/api/config` | Actualizar configuracion |

Para documentacion completa de la API, consultar [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md).

---

## Estructura del Proyecto

```
brincapark-reservation-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Conexion a MongoDB
│   │   ├── middleware/
│   │   │   └── adminAuth.js       # Autenticacion admin
│   │   ├── models/
│   │   │   ├── Reservation.js     # Modelo de Reserva
│   │   │   ├── Config.js          # Modelo de Configuracion
│   │   │   └── index.js           # Exportador de modelos
│   │   ├── routes/
│   │   │   ├── reservations.js    # Rutas de reservas
│   │   │   ├── admin.js           # Rutas administrativas
│   │   │   └── config.js          # Rutas de configuracion
│   │   └── index.js               # Punto de entrada
│   ├── .env.example               # Ejemplo de variables de entorno
│   └── package.json
│
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── index.css          # Estilos pagina principal
│   │   │   ├── admin.css          # Estilos panel admin
│   │   │   ├── admin-mejoras.css
│   │   │   ├── admin-funcionalidades.css
│   │   │   ├── admin-analytics.css
│   │   │   └── normativas.css
│   │   ├── js/
│   │   │   ├── main.js            # Logica principal + Barba.js
│   │   │   ├── admin.js           # Logica panel admin
│   │   │   ├── admin-funcionalidades.js
│   │   │   ├── admin-analytics.js
│   │   │   ├── api.js             # Cliente API
│   │   │   └── pricing.js         # Sistema de precios dinamicos
│   │   ├── img/
│   │   └── fonts/
│   ├── index.html                 # Pagina principal
│   ├── admin.html                 # Panel administrativo
│   └── normativas.html            # Pagina de normativas
│
├── docs/
│   └── screenshots/               # Capturas de pantalla
│
├── .gitignore
├── README.md
└── DOCUMENTACION_TECNICA.md
```

---

## Configuracion

### Variables de Entorno (Backend)

Crear archivo `.env` en la carpeta `backend/`:

```env
# Puerto del servidor
PORT=4000

# URL de conexion a MongoDB
# Desarrollo local:
MONGO_URI=mongodb://localhost:27017/brincapark

# Produccion (MongoDB Atlas):
# MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/brincapark

# Clave secreta para acceso administrativo
ADMIN_SECRET=tu_clave_secreta_aqui
```

### Precios por Defecto

Los precios se configuran desde el panel administrativo:

**Tickets:**
| Tipo | Precio (USD) |
|------|--------------|
| 15 min | $6 |
| 30 min | $9 |
| 60 min | $10 |
| Full Day | $11 |
| Combo | $13 |

**Paquetes (Lunes-Jueves / Viernes-Domingo):**
| Paquete | L-J | V-D |
|---------|-----|-----|
| Mini (30 personas) | $150 | $180 |
| Mediano (60 personas) | $200 | $230 |
| Full (80 personas) | $250 | $280 |

---

## Capturas de Pantalla

### Pagina Principal

<div align="center">
  <img src="docs/screenshots/Hero-section.png" alt="Pagina Principal" width="80%">
  <p><em>Portada principal con diseno responsive.</em></p>
</div>

### Formulario de Reserva

<div align="center">
  <img src="docs/screenshots/Form.png" alt="Formulario de Reserva" width="80%">
  <p><em>Formulario con validaciones de logica de negocio.</em></p>
</div>

### Panel Administrativo

<div align="center">
  <img src="docs/screenshots/Dashboard.png" alt="Dashboard Principal" width="100%">
  <p><em>Dashboard con KPIs en tiempo real.</em></p>
</div>

### Calendario y Graficas

<div align="center">
  <img src="docs/screenshots/Calendar.png" alt="Calendario de Reservas" width="45%" style="margin-right: 10px;">
  <img src="docs/screenshots/Graphics.png" alt="Graficas Estadisticas" width="45%">
  <p><em>Visualizacion de ocupacion mensual y metricas comparativas.</em></p>
</div>

---

## Roadmap

### Version 1.0 (Actual - Produccion)

- [x] Sistema de reservas publico
- [x] Panel administrativo completo
- [x] Analytics y reportes con graficas
- [x] Exportacion PDF/Excel
- [x] Multi-moneda (USD/Bs)
- [x] Diseno responsive
- [x] Transiciones fluidas con Barba.js
- [x] Sistema de precios dinamicos con cache local
- [x] Despliegue en produccion (Vercel + Render)

### Version 1.1 (Planificado)

- [ ] Sistema de emails automaticos
- [ ] Notificaciones por WhatsApp
- [ ] Recordatorios de reservas
- [ ] Integracion con Google Calendar

### Version 2.0 (Futuro)

- [ ] Integracion de pagos (Stripe/PayPal)
- [ ] Sistema de cupones y descuentos
- [ ] Autenticacion multi-usuario
- [ ] Roles y permisos
- [ ] App movil nativa

---

## Licencia

Este proyecto esta bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para mas detalles.

---

## Autor

**Giuseppe**

- GitHub: [@GiuDPC](https://github.com/GiuDPC)
- Proyecto: [brincapark-reservation-system](https://github.com/GiuDPC/brincapark-reservation-system)
- Demo: [brincapark-reservation-system.vercel.app](https://brincapark-reservation-system.vercel.app/)

---

## Agradecimientos

- [Chart.js](https://www.chartjs.org/) - Visualizacion de datos
- [SweetAlert2](https://sweetalert2.github.io/) - Alertas modernas
- [Barba.js](https://barba.js.org/) - Transiciones de pagina
- [GSAP](https://greensock.com/gsap/) - Animaciones
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Base de datos en la nube
- [Vercel](https://vercel.com/) - Hosting frontend
- [Render](https://render.com/) - Hosting backend
