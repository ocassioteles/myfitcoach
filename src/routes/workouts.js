const express = require('express');
const { getAllWorkouts, getWorkoutsByUserId, getWorkoutById, createWorkout, updateWorkout, deleteWorkout } = require('../controllers/workoutController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllWorkouts);
router.get('/:id', getWorkoutById);
router.get('/user/:userId', authMiddleware, getWorkoutsByUserId);
router.post('/', authMiddleware, createWorkout);
router.put('/:id', authMiddleware, updateWorkout);
router.delete('/:id', authMiddleware, deleteWorkout);

module.exports = router;