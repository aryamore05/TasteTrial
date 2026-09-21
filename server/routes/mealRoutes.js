const express = require('express');
const router = express.Router();
const {
  searchMeals,
  getMealById,
  getRandomMeal,
  getCategories,
  getAreas,
  filterMeals,
  matchIngredients,
} = require('../controllers/mealController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Specific paths first
router.get('/search', optionalAuth, searchMeals);
router.get('/random', getRandomMeal);
router.get('/categories', getCategories);
router.get('/areas', getAreas);
router.get('/filter', optionalAuth, filterMeals);
router.post('/ingredients-match', optionalAuth, matchIngredients);

// Dynamic path last
router.get('/:id', getMealById);

module.exports = router;
