const express = require('express');
const { getAllWorkouts, getWorkoutsByUserId } = require('../controllers/workoutController');

const router = express.Router();

router.get('/', getAllWorkouts);
router.get('/user/:userId', getWorkoutsByUserId);

module.exports = router;