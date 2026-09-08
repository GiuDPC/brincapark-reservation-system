# Documentación Técnica - BRINCAPARK

## Arquitectura del Sistema

### Visión General

BRINCAPARK utiliza una arquitectura cliente-servidor con separación clara entre frontend y backend.

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Cliente   │ ◄─────► │   Backend   │ ◄─────► │   MongoDB   │
│  (Browser)  │  HTTP   │  (Express)  │  Driver │  (Database) │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Flujo de Datos

1. Usuario interactúa con la interfaz (HTML/CSS/JS)
2. JavaScript envía petición HTTP al backend
3. Backend valida y procesa la petición
4. Backend consulta/modifica la base de datos
5. Backend responde con JSON
6. Frontend actualiza la interfaz

## Backend

### Estructura de Carpetas

```
backend/src/
├── config/
│   └── database.js       # Conexión a MongoDB
├── middleware/
│   └── adminAuth.js      # Autenticación de administrador
├── models/
│   └── Reservation.js    # Modelo de datos de reserva
├── routes/
│   ├── admin.js          # Rutas administrativas
│   └── reservations.js   # Rutas públicas
└── index.js              # Punto de entrada
```

### Modelos de Datos

#### Reservation

```javascript
{
  nombreCompleto: {
    type: String,
    required: true,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  telefono: {
    type: String,
    required: true
  },
  paquete: {
    type: String,
    required: true
  },
  fechaServicio: {
    type: Date,
    required: true
  },
  horaReservacion: {
    type: String,
    required: true
  },
  parque: {
    type: String,
    required: true,
    enum: ['Maracaibo', 'Caracas', 'Punto Fijo']
  },
  estadoUbicacion: {
    type: String,
    required: true
  },
  tipoEvento: {
    type: String,
    required: true
  },
  estadoReserva: {
    type: String,
    default: 'pendiente',
    enum: ['pendiente', 'aprobado', 'cancelado']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

### API Endpoints

#### Públicos

**POST /api/reservations**
- Descripción: Crear nueva reserva
- Body: Objeto Reservation
- Respuesta: Reserva creada con ID

**GET /api/reservations**
- Descripción: Listar todas las reservas
- Query params: Ninguno
- Respuesta: Array de reservas

**GET /api/reservations/occupied-slots**
- Descripción: Obtener horarios ocupados por fecha y parque
- Query params: fecha, parque
- Respuesta: Array de horarios ocupados

#### Administrativos (Requieren autenticación JWT)

**POST /api/admin/login**
- Descripción: Inicio de sesión administrativo y para evaluadores demo
- Body: `{ "secret": "..." }`
- Respuesta: `{ token, role, isDemo, message }`

**GET /api/admin/reservas**
- Descripción: Listar todas las reservas (admin / demo)
- Headers: `Authorization: Bearer <token>`
- Respuesta: Array de reservas

**PATCH /api/admin/reservas/:id**
- Descripción: Actualizar reserva
- Headers: `Authorization: Bearer <token>`
- Body: `{ "estado": "pendiente" | "aprobado" | "cancelado" }`
- Respuesta: Reserva actualizada (en sesión demo se simula protegiendo la base de datos principal)

**DELETE /api/admin/reservas/:id**
- Descripción: Eliminar reserva
- Headers: `Authorization: Bearer <token>`
- Respuesta: Confirmación de eliminación (en sesión demo se simula protegiendo la base de datos principal)

### Middleware

#### adminAuth

Valida que las peticiones administrativas incluyan un token JWT válido en el header `Authorization`:

```typescript
function adminAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Acceso denegado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || "brincapark_jwt_secure_key_2026";
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Acceso denegado" });
  }
}
```

## Frontend

### Estructura de Archivos

```
frontend/assets/
├── css/
│   ├── admin.css              # Estilos del panel admin
│   ├── admin-mejoras.css      # Mejoras visuales del admin
│   ├── admin-funcionalidades.css  # Estilos de funcionalidades finales
│   ├── index.css              # Estilos de página principal
│   ├── normativas.css         # Estilos de normativas
│   └── styles.css             # Estilos base
├── js/
│   ├── admin.js               # Lógica del panel admin
│   ├── admin-funcionalidades.js  # Funcionalidades finales
│   ├── api.js                 # Cliente API
│   └── main.js                # Lógica página principal
└── img/
    └── (imágenes del proyecto)
```

### Módulos JavaScript

#### api.js

Cliente para comunicación con el backend.

```javascript
const API_URL = "http://localhost:4000/api";

async function crearReserva(data) {
  const response = await fetch(`${API_URL}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return await response.json();
}
```

#### admin.js

Gestión completa del panel administrativo:
- Autenticación
- Dashboard con estadísticas
- Gestión de reservas
- Reportes y exportación
- Gráficas

#### admin-funcionalidades.js

Funcionalidades adicionales:
- Panel de configuración
- Sistema de notificaciones
- Gráfica de distribución por parque

#### main.js

Lógica de la página principal:
- Formulario de reservas
- Validación de datos
- Carrusel de imágenes
- Horarios dinámicos

### Sistema de Configuración

La configuración se guarda en localStorage:

```javascript
const config = {
  moneda: "USD",
  tasaBCV: 244.65,
  tickets: {
    min15: 6,
    min30: 9,
    min60: 10,
    fullday: 11,
    combo: 13
  },
  paquetes: {
    mini: { lunes: 150, viernes: 180 },
    mediano: { lunes: 200, viernes: 230 },
    full: { lunes: 250, viernes: 280 }
  }
};

localStorage.setItem("brincapark_config", JSON.stringify(config));
```

### Sistema de Notificaciones

Actualización automática cada 30 segundos:

```javascript
setInterval(() => {
  if (typeof reservas !== 'undefined') {
    actualizarContadorNotificaciones();
  }
}, 30000);
```

## Seguridad

### Variables de Entorno

Datos sensibles en `.env`:
```
ADMIN_SECRET=clave_secreta_compleja
MONGODB_URI=mongodb://localhost:27017/brincapark
PORT=4000
```

### Validación

**Frontend:**
- Validación de formularios con HTML5
- Validación adicional con JavaScript
- Sanitización de inputs

**Backend:**
- Validación de tipos de datos
- Validación de campos requeridos
- Sanitización con Mongoose

### CORS

Configurado para permitir peticiones desde el frontend:

```javascript
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
```

## Performance

### Optimizaciones CSS

- Variables CSS para reutilización
- GPU acceleration con `transform` y `will-change`
- Animaciones optimizadas
- Media queries para responsive

### Optimizaciones JavaScript

- Debouncing en búsquedas
- Event delegation
- Lazy loading de imágenes
- Caché de datos en localStorage

### Base de Datos

- Índices en campos frecuentemente consultados
- Consultas optimizadas
- Paginación (preparado para implementar)

## Testing

### Pruebas Manuales

Checklist de funcionalidades:
- [ ] Crear reserva desde formulario público
- [ ] Login al panel admin
- [ ] Ver dashboard con estadísticas
- [ ] Aprobar/cancelar reservas
- [ ] Exportar a PDF/Excel
- [ ] Configurar precios
- [ ] Ver notificaciones
- [ ] Responsive en móvil

### Pruebas de API

Usar Postman o similar para probar endpoints:

```bash
# Crear reserva
POST http://localhost:4000/api/reservations
Content-Type: application/json

{
  "nombreCompleto": "Test User",
  "correo": "test@example.com",
  ...
}

# Listar reservas (admin)
GET http://localhost:4000/api/admin/reservations
x-admin-secret: tu_clave_secreta
```

## Despliegue

### Preparación para Producción

1. Configurar variables de entorno de producción
2. Usar MongoDB Atlas para base de datos
3. Desplegar backend en Heroku/Railway/Render
4. Desplegar frontend en Netlify/Vercel
5. Configurar CORS para dominio de producción
6. Habilitar HTTPS

### Variables de Entorno de Producción

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/brincapark
ADMIN_SECRET=clave_muy_segura_y_larga
FRONTEND_URL=https://tu-dominio.com
```

## Mantenimiento

### Logs

Implementar sistema de logging:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Backups

- Backup diario de MongoDB
- Versionado de código con Git
- Backups de configuración

### Monitoreo

- Uptime monitoring
- Error tracking
- Performance monitoring

## Escalabilidad

### Horizontal Scaling

- Múltiples instancias del backend con load balancer
- MongoDB replica set
- CDN para assets estáticos

### Vertical Scaling

- Aumentar recursos del servidor
- Optimizar queries de base de datos
- Implementar caché (Redis)

## Glosario

- **Reserva**: Solicitud de servicio en el parque
- **Paquete**: Conjunto de servicios para eventos
- **Ticket**: Entrada individual al parque
- **Parque**: Ubicación física del servicio
- **Estado**: Situación actual de la reserva (pendiente/aprobado/cancelado)

---

**Última actualización:** Noviembre 2025
