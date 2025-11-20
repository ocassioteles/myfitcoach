const { PrismaClient } = require('@prisma/client');

// Configuração do Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Logs para desenvolvimento
});

// Função para conectar ao banco
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

// Função para desconectar do banco
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};
