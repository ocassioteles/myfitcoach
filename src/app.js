const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importar rotas
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const communityRoutes = require('./routes/community');
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
app.use(helmet());
// CORS seguro: permitir apenas a origem do frontend configurada no .env
const { FRONTEND_ORIGIN } = process.env;
const corsOptions = {
  origin: FRONTEND_ORIGIN ? [FRONTEND_ORIGIN] : true, // em dev, se não informado, permite todos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
  res.json({ 
    message: '🏋️ API Fitness Social funcionando!',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      workouts: '/api/workouts',
      community: '/api/community'
    },
    timestamp: new Date().toISOString()
  });
});

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/community', communityRoutes);

module.exports = app;