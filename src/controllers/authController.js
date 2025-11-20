// src/controllers/authController.js
// Controlador de autenticação: registro, login, refresh, logout e /me
// Explica cada prática com comentários didáticos

const { prisma } = require('../config/database');
const {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  createRefreshToken,
  useAndRotateRefreshToken,
  revokeRefreshToken,
} = require('../services/authService');

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email já registrado.' });
    }

    // Hash seguro com Argon2id
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const access = generateAccessToken(user);
    const refresh = await createRefreshToken(user.id);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      tokens: {
        accessToken: access.token,
        accessTokenExpiresAt: access.expiresAt,
        refreshToken: refresh.token,
        refreshTokenExpiresAt: refresh.expiresAt,
      },
    });
  } catch (err) {
    console.error('Erro no register:', err);
    return res.status(500).json({ success: false, message: 'Erro ao registrar.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const access = generateAccessToken(user);
    const refresh = await createRefreshToken(user.id);

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      tokens: {
        accessToken: access.token,
        accessTokenExpiresAt: access.expiresAt,
        refreshToken: refresh.token,
        refreshTokenExpiresAt: refresh.expiresAt,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, message: 'Erro ao autenticar.' });
  }
}

// POST /api/auth/refresh
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token é obrigatório.' });
    }

    // Usa e rotaciona (o antigo é automaticamente revogado)
    const rotated = await useAndRotateRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: rotated.userId } });
    if (!user) return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });

    const access = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      tokens: {
        accessToken: access.token,
        accessTokenExpiresAt: access.expiresAt,
        refreshToken: rotated.token,
        refreshTokenExpiresAt: rotated.expiresAt,
      },
    });
  } catch (err) {
    const code = err?.message || '';
    if (['INVALID_TOKEN', 'TOKEN_REVOKED', 'TOKEN_EXPIRED'].includes(code)) {
      return res.status(401).json({ success: false, message: 'Refresh token inválido, expirado ou já utilizado.' });
    }
    console.error('Erro no refresh:', err);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar token.' });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token é obrigatório.' });
    }
    await revokeRefreshToken(refreshToken);
    return res.status(200).json({ success: true, message: 'Logout realizado.' });
  } catch (err) {
    console.error('Erro no logout:', err);
    return res.status(500).json({ success: false, message: 'Erro ao sair.' });
  }
}

// GET /api/auth/me (protegido)
async function me(req, res) {
  try {
    const sub = Number(req.auth?.sub);
    if (!sub) return res.status(401).json({ success: false, message: 'Não autorizado.' });

    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });

    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Erro no me:', err);
    return res.status(500).json({ success: false, message: 'Erro ao obter perfil.' });
  }
}

module.exports = { register, login, refresh, logout, me };
