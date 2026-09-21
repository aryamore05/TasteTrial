const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  getHistory,
  addHistory,
  clearHistory,
  getRecommendations,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

// Favorites
router.route('/favorites')
  .get(getFavorites)
  .post(addFavorite);

router.delete('/favorites/:mealId', removeFavorite);

// Search History
router.route('/history')
  .get(getHistory)
  .post(addHistory)
  .delete(clearHistory);

// Recommendations
router.get('/recommendations', getRecommendations);

module.exports = router;
