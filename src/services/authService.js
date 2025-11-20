// Serviço de autenticação com práticas seguras para iniciantes, mas com parâmetros usados em produção
// - Hash de senha com Argon2id (parâmetros de tempo/memória/paralelismo)
// - JWT RS256 (carimbo assinado com chave privada da env)
// - Refresh Token opaco com rotação, persistido no banco via Prisma

const crypto = require('crypto');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');
const { prisma } = require('../config/database');

// ======= Parâmetros e utilidades =======
  const {
    JWT_PRIVATE_KEY = '',
    JWT_PUBLIC_KEY = '',
    JWT_SECRET = '',
    TOKEN_ALG = 'RS256',
    ACCESS_TOKEN_TTL = '15m', // tempo de vida do access token
    REFRESH_TOKEN_TTL = '30d', // tempo de vida do refresh token
  } = process.env;

// Normaliza chaves PEM vindas do .env quando são passadas em uma única linha com \n
const PRIVATE_KEY = (JWT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const PUBLIC_KEY = (JWT_PUBLIC_KEY || '').replace(/\\n/g, '\n');

// Seleção de algoritmo/segredo para assinar/verificar JWT
const ALG = (TOKEN_ALG || 'RS256').toUpperCase();
const SIGN_KEY = ALG === 'HS256' ? (JWT_SECRET || '') : PRIVATE_KEY;
const VERIFY_KEY = ALG === 'HS256' ? (JWT_SECRET || '') : PUBLIC_KEY;

if (ALG === 'RS256' && (!JWT_PRIVATE_KEY || !JWT_PUBLIC_KEY)) {
  console.warn('⚠️ JWT_PRIVATE_KEY/JWT_PUBLIC_KEY não configurados. Configure no .env para RS256 ou defina TOKEN_ALG=HS256 e JWT_SECRET para desenvolvimento.');
}

const ARGON_OPTIONS = {
  type: argon2.argon2id,
  timeCost: 3,       // número de iterações
  memoryCost: 1 << 15, // ~32 MB
  parallelism: 1,    // threads
};

// ======= Hash/Senha =======
async function hashPassword(plain) {
  // Argon2 já inclui salt aleatório no hash; não armazene o salt separado
  return argon2.hash(plain, ARGON_OPTIONS);
}

async function verifyPassword(hash, plain) {
  return argon2.verify(hash, plain);
}

// ======= JWT (Access Token) =======
function generateAccessToken(user) {
  const payload = {
    sub: String(user.id),
    name: user.name,
    email: user.email,
  };
  const token = jwt.sign(payload, SIGN_KEY, {
    algorithm: ALG,
    expiresIn: ACCESS_TOKEN_TTL,
    issuer: 'academia-api',
  });
  const expMs = Date.now() + ms(ACCESS_TOKEN_TTL);
  return { token, expiresAt: new Date(expMs).toISOString() };
}

function verifyAccessToken(token) {
  return jwt.verify(token, VERIFY_KEY, { algorithms: [ALG], issuer: 'academia-api' });
}

// ======= Refresh Token (opaco, rotacionável) =======
function generateOpaqueToken() {
  return crypto.randomBytes(64).toString('base64url'); // string segura e curta
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createRefreshToken(userId) {
  const token = generateOpaqueToken();
  const tokenHash = hashToken(token);
  const jti = uuidv4();
  const expiresAt = new Date(Date.now() + ms(REFRESH_TOKEN_TTL));

  const saved = await prisma.refreshToken.create({
    data: { userId, tokenHash, jti, expiresAt },
  });

  return {
    token,
    jti: saved.jti,
    expiresAt: saved.expiresAt.toISOString(),
  };
}

async function useAndRotateRefreshToken(oldToken) {
  const oldHash = hashToken(oldToken);
  const record = await prisma.refreshToken.findFirst({ where: { tokenHash: oldHash } });

  if (!record) throw new Error('INVALID_TOKEN');
  if (record.revokedAt) throw new Error('TOKEN_REVOKED');
  if (record.expiresAt < new Date()) throw new Error('TOKEN_EXPIRED');

  // Revoga o token antigo
  const now = new Date();
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: now },
  });

  // Gera novo token e encadeia a relação
  const { token, jti, expiresAt } = await createRefreshToken(record.userId);

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { replacedByToken: jti },
  });

  return { userId: record.userId, token, jti, expiresAt };
}

async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  const record = await prisma.refreshToken.findFirst({ where: { tokenHash } });
  if (!record) return; // nada a fazer
  if (record.revokedAt) return;
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
}

async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  // senha
  hashPassword,
  verifyPassword,
  // jwt
  generateAccessToken,
  verifyAccessToken,
  // refresh
  createRefreshToken,
  useAndRotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
