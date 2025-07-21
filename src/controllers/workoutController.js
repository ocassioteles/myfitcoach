const { workouts } = require('../../data/mockData');

const getAllWorkouts = (req, res) => {
  res.json({
    success: true,
    data: workouts,
    total: workouts.length
  });
};

const getWorkoutsByUserId = (req, res) => {
  const { userId } = req.params;
  const userWorkouts = workouts.filter(w => w.userId === parseInt(userId));
  
  res.json({
    success: true,
    data: userWorkouts,
    total: userWorkouts.length
  });
};

module.exports = {
  getAllWorkouts,
  getWorkoutsByUserId
};