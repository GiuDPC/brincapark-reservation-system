# BRINCAPARK - Sistema Integral de Gestión de Reservas

Sistema completo de gestión de reservas para parques de inflables BRINCAPARK, con sitio web público y panel administrativo.

## Descripción del Proyecto

BRINCAPARK es una plataforma web integral que permite a los clientes realizar reservas de paquetes de fiesta en parques de inflables ubicados en Venezuela (Maracaibo, Caracas y Punto Fijo). El sistema incluye un sitio web público para visualizar información y realizar reservas, así como un panel administrativo completo para gestionar las reservas, visualizar estadísticas y generar reportes.

## Características Principales

### Sitio Web Público

- Página principal con información del parque y servicios
- Sistema de ticketería con diferentes opciones de tiempo
- Paquetes de fiesta personalizables (Mini, Mediano, Full)
- Formulario de reservas en línea
- Galería de imágenes con carrusel interactivo
- Información de horarios y ubicaciones
- Diseño responsive y moderno

### Panel Administrativo

- Sistema de autenticación seguro
- Dashboard con estadísticas en tiempo real
- Gestión completa de reservas (crear, editar, eliminar)
- Filtrado de reservas por parque
- Cambio de estados de reservas (pendiente, aprobado, cancelado)
- Visualización de datos con gráficos (Chart.js)
- Calendario de reservas
- Sistema de notificaciones
- Exportación de reportes en PDF y Excel
- Métricas avanzadas y comparativas

## Tecnologías Utilizadas

### Backend

- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **dotenv** - Gestión de variables de entorno
- **cors** - Middleware para habilitar CORS
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación con JWT

### Frontend

- **HTML5** - Estructura del sitio
- **CSS3** - Estilos y diseño responsive
- **JavaScript (Vanilla)** - Lógica del cliente
- **SweetAlert2** - Alertas y notificaciones elegantes
- **Chart.js** - Gráficos y visualización de datos
- **jsPDF** - Generación de documentos PDF
- **SheetJS (xlsx)** - Exportación a Excel

## Estructura del Proyecto

```
ParqueSistemaIntegralC/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Configuración de MongoDB
│   │   ├── middleware/
│   │   │   └── adminAuth.js          # Middleware de autenticación
│   │   ├── models/
│   │   │   ├── Reservation.js        # Modelo de reservas
│   │   │   └── index.js              # Exportación de modelos
│   │   ├── routes/
│   │   │   ├── reservations.js       # Rutas de reservas públicas
│   │   │   └── admin.js              # Rutas administrativas
│   │   └── index.js                  # Punto de entrada del servidor
│   ├── data/                         # Datos persistentes
│   ├── .env                          # Variables de entorno
│   ├── .gitignore
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── index.css             # Estilos del sitio público
│   │   │   ├── admin.css             # Estilos del panel admin
│   │   │   └── variables.css         # Variables CSS
│   │   ├── js/
│   │   │   ├── main.js               # Lógica del sitio público
│   │   │   ├── admin.js              # Lógica del panel admin
│   │   │   └── api.js                # Funciones de API
│   │   ├── img/                      # Imágenes del sitio
│   │   └── fonts/                    # Fuentes personalizadas
│   ├── index.html                    # Página principal
│   ├── admin.html                    # Panel administrativo
│   ├── .gitignore
│   └── README.md
│
├── .gitignore
└── README.md
```

## Instalación y Configuración

### Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)
- pnpm (gestor de paquetes)

### Instalación del Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Configurar variables de entorno:

Crear un archivo `.env` en el directorio `backend/` con el siguiente contenido:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/brincapark
ADMIN_SECRET=tu_clave_secreta_aqui
```

4. Iniciar el servidor:

**Modo desarrollo (con nodemon):**
```bash
pnpm run dev
```

**Modo producción:**
```bash
pnpm start
```

El servidor estará disponible en `http://localhost:4000`

### Configuración del Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Configurar la URL del API:

Editar el archivo `assets/js/api.js` y actualizar la constante `API_URL`:

```javascript
const API_URL = "http://localhost:4000/api";
```

3. Abrir el sitio web:

Abrir `index.html` en un navegador web o usar un servidor local como Live Server.

## API Endpoints

### Endpoints Públicos

#### Crear Reserva
```http
POST /api/reservations
Content-Type: application/json

{
  "nombreCompleto": "Juan Pérez",
  "correo": "juan@example.com",
  "telefono": "04141234567",
  "paquete": "mini",
  "fechaServicio": "2025-12-25",
  "horaReservacion": "10am-1pm",
  "parque": "Maracaibo",
  "estadoUbicacion": "Zulia",
  "tipoEvento": "Cumpleaños"
}
```

#### Listar Todas las Reservas
```http
GET /api/reservations
```

#### Obtener Horarios Ocupados
```http
GET /api/reservations/horarios-ocupados?fechaServicio=2025-12-25&parque=Maracaibo
```

#### Obtener Reserva por ID
```http
GET /api/reservations/:id
```

#### Actualizar Reserva
```http
PUT /api/reservations/:id
Content-Type: application/json

{
  "nombreCompleto": "Juan Pérez Actualizado",
  "correo": "juan.nuevo@example.com",
  ...
}
```

#### Cambiar Estado de Reserva
```http
PUT /api/reservations/:id/estado
Content-Type: application/json

{
  "estadoReserva": "aprobado"
}
```

#### Eliminar Reserva
```http
DELETE /api/reservations/:id
```

### Endpoints Administrativos

Todos los endpoints administrativos requieren el header `x-admin-secret` con el valor configurado en `.env`.

#### Listar Reservas (Admin)
```http
GET /api/admin/reservas
x-admin-secret: tu_clave_secreta
```

#### Cambiar Estado (Admin)
```http
PATCH /api/admin/reservas/:id
x-admin-secret: tu_clave_secreta
Content-Type: application/json

{
  "estado": "aprobado"
}
```

#### Eliminar Reserva (Admin)
```http
DELETE /api/admin/reservas/:id
x-admin-secret: tu_clave_secreta
```

## Modelo de Datos

### Reserva (Reservation)

```javascript
{
  nombreCompleto: String,        // Nombre completo del cliente
  correo: String,                // Email de contacto
  telefono: String,              // Teléfono de contacto
  paquete: String,               // "mini", "mediana", "full"
  fechaServicio: String,         // Fecha en formato YYYY-MM-DD
  horaReservacion: String,       // "10am-1pm", "2pm-5pm", "6pm-9pm"
  parque: String,                // "Maracaibo", "Caracas", "Punto Fijo"
  estadoUbicacion: String,       // Estado de Venezuela
  tipoEvento: String,            // Tipo de evento
  estadoReserva: String,         // "pendiente", "aprobado", "cancelado"
  createdAt: Date                // Fecha de creación
}
```

## Paquetes de Fiesta

### Paquete Mini (30 personas)
- 3 horas de diversión
- 100 vasos de refrescos
- 2 bowls de cotufas
- Anfitriones de apoyo
- Pintacaritas y espadas de globo
- Giftcard para el cumpleañero
- Precio: $150 (L-J) / $180 (V-D)

### Paquete Mediano (60 personas)
- 3 horas de diversión
- 150 vasos de refrescos
- 2 bowls de cotufas
- Anfitriones de apoyo
- Pintacaritas y espadas de globo
- Giftcard para el cumpleañero
- Precio: $200 (L-J) / $230 (V-D)

### Paquete Full (80 personas)
- 3 horas de diversión
- 200 vasos de refrescos
- 3 bowls de cotufas
- Anfitriones de apoyo
- Pintacaritas y espadas de globo
- Giftcard para el cumpleañero
- Precio: $250 (L-J) / $280 (V-D)

## Ubicaciones

### Maracaibo
- Ubicación: Sambil Maracaibo
- Horario: 10:00am - 9:00pm (L-D)

### Caracas
- Ubicación: Sambil Caracas
- Horario: 10:00am - 9:00pm (L-D)

### Punto Fijo
- Ubicación: Sambil Paraguana
- Horario: 10:00am - 9:00pm (L-D)

## Funcionalidades del Panel Administrativo

### Dashboard Principal
- Estadísticas en tiempo real (total de reservas, ingresos, reservas por parque)
- Calendario visual de reservas
- Gráfico de distribución de reservas por parque
- Notificaciones de nuevas reservas

### Gestión de Reservas
- Tabla completa con todas las reservas
- Filtrado por parque
- Búsqueda de reservas
- Edición de datos de reservas
- Cambio de estados (pendiente/aprobado/cancelado)
- Eliminación de reservas

### Reportes
- Exportación a PDF con tabla detallada
- Exportación a Excel (.xlsx)
- Métricas avanzadas:
  - Gráfico de reservas por mes
  - Comparativa entre parques
  - Análisis de ingresos

## Seguridad

- Autenticación mediante código secreto para panel administrativo
- Middleware de validación en rutas administrativas
- Validación de datos en backend
- Prevención de reservas duplicadas (mismo horario, fecha y parque)
- Variables de entorno para datos sensibles
- CORS configurado para desarrollo

## Despliegue

### Backend

**Opciones de despliegue:**
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

**Variables de entorno requeridas:**
- `PORT` - Puerto del servidor
- `MONGO_URI` - URI de conexión a MongoDB
- `ADMIN_SECRET` - Clave secreta de administrador

### Frontend

**Opciones de despliegue:**
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

**Configuración:**
- Actualizar `API_URL` en `assets/js/api.js` con la URL del backend en producción

### Base de Datos

**MongoDB Atlas (Recomendado):**
1. Crear cuenta en MongoDB Atlas
2. Crear un cluster gratuito
3. Configurar acceso de red (IP whitelist)
4. Obtener URI de conexión
5. Actualizar `MONGO_URI` en `.env`

## Mantenimiento

### Backup de Base de Datos

```bash
mongodump --uri="mongodb://localhost:27017/brincapark" --out=./backup
```

### Restaurar Base de Datos

```bash
mongorestore --uri="mongodb://localhost:27017/brincapark" ./backup/brincapark
```

### Logs del Servidor

Los logs se muestran en la consola. Para producción, considerar usar:
- Winston (logging library)
- PM2 (process manager con logs)

## Solución de Problemas

### El backend no se conecta a MongoDB

- Verificar que MongoDB esté corriendo
- Verificar la URI en `.env`
- Verificar permisos de red en MongoDB Atlas

### El frontend no se comunica con el backend

- Verificar que el backend esté corriendo
- Verificar la URL en `api.js`
- Verificar configuración de CORS
- Revisar la consola del navegador para errores

### Error al crear reservas

- Verificar que todos los campos requeridos estén completos
- Verificar que el horario no esté ocupado
- Revisar logs del servidor para detalles

## Contribución

Este es un proyecto privado de BRINCAPARK. Para contribuciones o sugerencias, contactar al equipo de desarrollo.

## Licencia

Todos los derechos reservados © 2025 BRINCAPARK

## Contacto

- Email: info@brincapark.com
- Teléfono: (0212) BRINCA

## Versión

**Versión actual:** 1.0.0

## Changelog

### v1.0.0 (2025-11-23)
- Lanzamiento inicial del sistema
- Sitio web público completo
- Panel administrativo funcional
- Sistema de reservas implementado
- Exportación de reportes
- Gráficos y estadísticas
