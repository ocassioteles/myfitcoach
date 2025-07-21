const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importar rotas
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
  res.json({ 
    message: '🏋️ API Academia funcionando!',
    endpoints: {
      users: '/api/users',
      workouts: '/api/workouts'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);

module.exports = app;