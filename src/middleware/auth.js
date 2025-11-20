// src/middleware/auth.js
// Middleware de autenticação via Access Token (JWT RS256)
// - Lê o header Authorization: Bearer <token>
// - Verifica assinatura e validade
// - Anexa o usuário decodificado em req.auth

const { verifyAccessToken } = require('../services/authService');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token ausente' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.auth = decoded; // { sub, name, email, iat, exp, iss }
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado' });
  }
}

module.exports = { authMiddleware };
