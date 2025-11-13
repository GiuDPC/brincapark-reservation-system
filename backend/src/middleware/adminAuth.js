// src/middleware/adminAuth.js
require('dotenv').config();

function adminAuth(req, res, next) {
  const secretFromHeader = req.headers['x-admin-secret']; // header personalizado
  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_SECRET no configurado en .env' });
  }
  if (!secretFromHeader) {
    return res.status(401).json({ error: 'Cabecera x-admin-secret requerida' });
  }
  if (secretFromHeader !== expected) {
    return res.status(403).json({ error: 'Acceso denegado: secreto incorrecto' });
  }
  next(); // secreto correcto -> continuar
}

module.exports = adminAuth;
