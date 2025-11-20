const express = require('express');
const { 
  followUser, 
  unfollowUser, 
  getFollowers, 
  getFollowing,
  addWorkoutComment,
  getWorkoutComments,
  getCommunityFeed,
  compareExercisePerformance,
  getCommunityUsers
} = require('../controllers/communityController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// === SEGUIR USUÁRIOS ===
router.post('/follow', authMiddleware, followUser);
router.delete('/unfollow', authMiddleware, unfollowUser);
router.get('/followers/:userId', authMiddleware, getFollowers);
router.get('/following/:userId', authMiddleware, getFollowing);

// === COMENTÁRIOS ===
router.post('/comments', authMiddleware, addWorkoutComment);
router.get('/comments/:workoutSessionId', getWorkoutComments);

// === FEED DA COMUNIDADE ===
router.get('/feed', getCommunityFeed);
router.get('/users', getCommunityUsers);

// === COMPARATIVOS ===
router.get('/compare', authMiddleware, compareExercisePerformance);

module.exports = router;
