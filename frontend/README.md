# BRINCAPARK - Sistema de Gestión y Promoción

Sistema completo para la gestión de reservas y promoción del parque de inflables BRINCAPARK.

## Descripción del Proyecto

El ecosistema BRINCAPARK consta de dos módulos principales:

1. **Frontend (Landing Page)**: Portal público para promoción y captación de clientes
2. **Backend (API REST)**: Sistema de gestión administrativa con base de datos MongoDB


## Inicio Rápido

### Requisitos Previos

- **Node.js** (v14 o superior)
- **MongoDB** (local o MongoDB Atlas)
- **pnpm** (gestor de paquetes)

### 1. Configurar Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
# Crea un archivo .env con:
MONGO_URI=mongodb://localhost:27017/brincapark
PORT=4000
ADMIN_SECRET=tu_codigo_secreto_aqui

# Iniciar servidor
pnpm dev
```

El backend estará corriendo en `http://localhost:4000`

### 2. Abrir Frontend

```bash
# Navegar a la carpeta frontend
cd frontend

# Abrir index.html directamente en tu navegador
# O usar un servidor local simple:
npx serve .
```

**¡Importante!** El frontend NO requiere instalación de dependencias. Solo abre `index.html` en tu navegador.



## Estructura del Proyecto

```
ParqueSistemaIntegralC/
├── backend/                    # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # Conexión a MongoDB
│   │   ├── models/
│   │   │   └── Reservation.js # Modelo de datos
│   │   ├── routes/
│   │   │   ├── reservations.js # Rutas públicas
│   │   │   └── admin.js       # Rutas administrativas
│   │   ├── middleware/
│   │   │   └── adminAuth.js   # Autenticación admin
│   │   └── index.js           # Punto de entrada
│   ├── package.json
│   └── .env                   # Variables de entorno
│
└── frontend/                   # Landing page + Panel admin
    ├── assets/
    │   ├── css/
    │   │   └── styles.css     # Estilos personalizados
    │   ├── js/
    │   │   ├── api.js         # Comunicación con backend
    │   │   ├── main.js        # Lógica landing page
    │   │   └── admin.js       # Lógica panel admin
    │   └── img/               # Imágenes (agregar aquí)
    ├── index.html             # Landing page pública
    ├── admin.html             # Panel administrativo
    └── README.md              # Este archivo
```

---

## Frontend

### Landing Page (`index.html`)

**URL**: `http://localhost:puerto/index.html` o abre el archivo directamente

**Secciones**:
- Hero: Presentación del parque
- Nosotros: Beneficios y seguridad
- Tiquetera: Precios de entradas (15min, 30min, 60min, Full Day)
- Paquetes de Fiesta: Mini, Mediano, Full
- Formulario de Reserva: Captación de leads
- Galería: Fotos del parque
- Footer: Contacto y horarios

**Tecnologías**:
- HTML5 semántico
- Tailwind CSS (vía CDN)
- Vanilla JavaScript
- Lucide Icons

### Panel Administrativo (`admin.html`)

**URL**: `http://localhost:puerto/admin.html` (ruta oculta)

**Funcionalidades**:
- Login con código secreto
- Dashboard con estadísticas (KPIs)
- Tabla de reservas
- Aprobar/Rechazar/Eliminar reservas
- Filtros por estado

**Acceso**:
1. Abre `admin.html`
2. Ingresa el código secreto (definido en `.env` del backend como `ADMIN_SECRET`)
3. Gestiona las reservas


## Backend (API)

### Endpoints Públicos

**Base URL**: `http://localhost:4000/api`

#### Crear Reserva
```http
POST /reservations
Content-Type: application/json

{
  "nombreCompleto": "Juan Pérez",
  "correo": "juan@example.com",
  "telefono": "555-1234",
  "paquete": "medio",
  "fechaServicio": "2024-12-25",
  "ciudad": "Caracas",
  "estadoUbicacion": "Miranda",
  "tipoEvento": "cumpleaños"
}
```

### Endpoints Administrativos

**Requieren header**: `x-admin-secret: tu_codigo_secreto`

#### Listar Reservas
```http
GET /admin/reservas
x-admin-secret: tu_codigo_secreto
```

#### Cambiar Estado
```http
PATCH /admin/reservas/:id
x-admin-secret: tu_codigo_secreto
Content-Type: application/json

{
  "estado": "aprobado"  // pendiente | aprobado | cancelado
}
```

#### Eliminar Reserva
```http
DELETE /admin/reservas/:id
x-admin-secret: tu_codigo_secreto
```

---

## Modelo de Datos

### Reservation (MongoDB)

```javascript
{
  nombreCompleto: String,      // Requerido
  correo: String,              // Requerido
  telefono: String,            // Requerido
  paquete: String,             // mini | medio | full | general
  fechaServicio: String,       // YYYY-MM-DD
  ciudad: String,
  estadoUbicacion: String,     // Estado/provincia
  tipoEvento: String,          // cumpleaños | escolar | etc.
  estadoReserva: String,       // pendiente | aprobado | cancelado
  createdAt: Date              // Auto-generado
}
```

---

## Personalización

### Cambiar Colores

Edita `assets/css/styles.css`:

```css
:root {
  --color-purple: #6B21A8;
  --color-pink: #EC4899;
  --color-yellow: #FBBF24;
  --color-blue: #3B82F6;
}
```

### Agregar Imágenes

1. Coloca tus imágenes en `assets/img/`
2. Reemplaza los placeholders en `index.html`:

```html
<!-- Antes -->
<div class="bg-gradient-to-br from-purple-200 to-pink-200">
  Placeholder
</div>

<!-- Después -->
<img src="./assets/img/hero.jpg" alt="BRINCAPARK" class="w-full h-full object-cover">
```

### Modificar Precios

Edita directamente en `index.html` las secciones de **Tiquetera** y **Paquetes de Fiesta**.

---

## Seguridad

- ✅ El panel admin está protegido con código secreto
- ✅ Las rutas administrativas requieren autenticación
- ✅ El código secreto se almacena en `.env` (no en el código)
- ✅ CORS habilitado solo para desarrollo (configurar en producción)

**Recomendaciones**:
- Cambia `ADMIN_SECRET` a un valor fuerte
- En producción, configura CORS específicamente
- Usa HTTPS en producción
- Considera agregar rate limiting

---

## Responsive

El diseño es completamente responsive y funciona en:
- Móviles (320px+)
- Tablets (768px+)
- Desktop (1024px+)

---

## Troubleshooting

### El formulario no envía datos

**Problema**: Error de CORS o backend no disponible

**Solución**:
1. Verifica que el backend esté corriendo (`pnpm dev` en `/backend`)
2. Abre la consola del navegador (F12) y revisa errores
3. Verifica que la URL en `assets/js/api.js` sea correcta:
   ```javascript
   const API_URL = 'http://localhost:4000/api';
   ```

### No puedo acceder al panel admin

**Problema**: Código secreto incorrecto

**Solución**:
1. Verifica el valor de `ADMIN_SECRET` en `backend/.env`
2. Asegúrate de que el backend esté corriendo
3. Revisa la consola del navegador para ver el error exacto

### MongoDB no conecta

**Problema**: Error de conexión a la base de datos

**Solución**:
1. Verifica que MongoDB esté corriendo:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```
2. O usa MongoDB Atlas (cloud) y actualiza `MONGO_URI` en `.env`

---

## Soporte

Para dudas o problemas:
- Revisa la consola del navegador (F12)
- Revisa los logs del backend en la terminal
- Verifica que todas las dependencias estén instaladas

---

## Licencia

Proyecto personal para uso universitario.

---

## Próximas Mejoras

- [ ] Sistema de notificaciones por email
- [ ] Exportar reservas a Excel/PDF
- [ ] Calendario visual de reservas
- [ ] Integración con pasarelas de pago
- [ ] Sistema de usuarios admin con roles

---

*** Listo para usar ***

Abre `index.html` en tu navegador y comienza a recibir reservas.
