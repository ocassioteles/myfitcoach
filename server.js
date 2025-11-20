require('dotenv').config();
const app = require('./src/app');
const { connectDatabase, disconnectDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Inicializar conexão com banco de dados
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🗄️ Banco de dados conectado com Prisma`);
  });
}).catch((error) => {
  console.error('❌ Falha ao conectar com o banco de dados:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await disconnectDatabase();
  process.exit(0);
});