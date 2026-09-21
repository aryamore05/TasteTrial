const mealDbService = require('../services/mealDbService');
const matchingService = require('../services/matchingService');
const User = require('../models/User');

/**
 * @route   GET /api/meals/search
 * @desc    Search meals by name
 * @access  Public
 */
const searchMeals = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const meals = await mealDbService.searchByName(query);

    // If authenticated user searched, optionally record to history
    if (req.user && query.trim()) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          history: {
            $each: [{ query: query.trim(), searchType: 'name', ingredients: [] }],
            $slice: -50, // Keep last 50
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      count: meals.length,
      meals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/meals/random
 * @desc    Get a random meal
 * @access  Public
 */
const getRandomMeal = async (req, res, next) => {
  try {
    const meal = await mealDbService.getRandomMeal();
    if (!meal) {
      return res.status(404).json({ success: false, message: 'No meal found' });
    }

    return res.status(200).json({
      success: true,
      meal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/meals/categories
 * @desc    Get all meal categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await mealDbService.getCategories();
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/meals/areas
 * @desc    Get all meal areas/cuisines
 * @access  Public
 */
const getAreas = async (req, res, next) => {
  try {
    const areas = await mealDbService.getAreas();
    return res.status(200).json({
      success: true,
      areas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/meals/filter
 * @desc    Filter meals by category, area, or single ingredient
 * @access  Public
 */
const filterMeals = async (req, res, next) => {
  try {
    const { category, area, ingredient } = req.query;
    let meals = [];

    if (category) {
      meals = await mealDbService.filterByCategory(category);
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            history: {
              $each: [{ query: category, searchType: 'category', ingredients: [] }],
              $slice: -50,
            },
          },
        });
      }
    } else if (area) {
      meals = await mealDbService.filterByArea(area);
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            history: {
              $each: [{ query: area, searchType: 'cuisine', ingredients: [] }],
              $slice: -50,
            },
          },
        });
      }
    } else if (ingredient) {
      meals = await mealDbService.filterByIngredient(ingredient);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, area, or ingredient query parameter',
      });
    }

    return res.status(200).json({
      success: true,
      count: meals.length,
      meals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/meals/:id
 * @desc    Get full meal details by ID
 * @access  Public
 */
const getMealById = async (req, res, next) => {
  try {
    const meal = await mealDbService.getMealById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    return res.status(200).json({
      success: true,
      meal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/meals/ingredients-match
 * @desc    Smart ingredient matching algorithm
 * @access  Public (Optionally logs to user history if authenticated)
 */
const matchIngredients = async (req, res, next) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of ingredients to match',
      });
    }

    const matchResults = await matchingService.matchMealsByIngredients(ingredients);

    // If user is authenticated, log this smart matching search
    if (req.user && matchResults.inputIngredients.length > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          history: {
            $each: [
              {
                query: matchResults.inputIngredients.join(', '),
                searchType: 'ingredients',
                ingredients: matchResults.inputIngredients,
              },
            ],
            $slice: -50,
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      totalMatches: matchResults.totalMatches,
      bestMatchesCount: matchResults.bestMatches.length,
      partialMatchesCount: matchResults.partialMatches.length,
      data: matchResults,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchMeals,
  getMealById,
  getRandomMeal,
  getCategories,
  getAreas,
  filterMeals,
  matchIngredients,
};
