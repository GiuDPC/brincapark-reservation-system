/**
 * MIDDLEWARE DE AUTENTICACIÓN ADMINISTRATIVA
 * 
 * Este middleware protege las rutas administrativas del backend.
 * Funciona verificando un secreto (contraseña) que viene en los headers
 * de la petición HTTP
 * 
 * Por qué usamos esto en lugar de JWT o sesiones
 * Es simple y suficiente para un panel admin de un solo usuario
 * No necesitamos gestionar multiples usuarios con diferentes permisos
 * Fácil de implementar y mantener


/**
 * Middleware que verifica si la petición tiene el secreto administrativo correcto
 * 
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para continuar al siguiente middleware/ruta
 */
function adminAuth(req, res, next) {
  // Obtenemos el secreto que el cliente envio en los headers
  // El header se llama x-admin-secret el prefijo x- indica que es personalizado
  const secretFromHeader = req.headers["x-admin-secret"];

  // Obtenemos el secreto correcto de las variables de entorno
  const expected = process.env.ADMIN_SECRET;

  // Primero verificamos que el secreto esté configurado en el servidor
  // Si no esta es un error de configuración del servidor
  if (!expected) {
    return res
      .status(500) // 500 = Error interno del servidor
      .json({ error: "ADMIN_SECRET no configurado en .env" });
  }

  // Verificamos que el cliente haya enviado el header
  if (!secretFromHeader) {
    return res
      .status(401) // 401 = No autenticado
      .json({ error: "Cabecera x-admin-secret requerida" });
  }

  // Verificamos que el secreto enviado sea correcto
  if (secretFromHeader !== expected) {
    return res
      .status(403) // 403 = Prohibido autenticado pero sin permiso
      .json({ error: "Acceso denegado: secreto incorrecto" });
  }

  //Todo correcto el secreto es valido
  //Llamamos a next() para que Express continue con la siguiente funcion
  //que sera la ruta que estamos protegiendo
  next();
}

module.exports = adminAuth;
