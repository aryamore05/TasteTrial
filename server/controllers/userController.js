const User = require('../models/User');
const recommendationService = require('../services/recommendationService');
const mealDbService = require('../services/mealDbService');

/**
 * @route   GET /api/users/favorites
 * @desc    Get current user's favorites
 * @access  Private
 */
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      count: user.favorites.length,
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/favorites
 * @desc    Add meal to favorites
 * @access  Private
 */
const addFavorite = async (req, res, next) => {
  try {
    const { mealId, mealName, mealThumb, category, area, ingredients } = req.body;

    if (!mealId) {
      return res.status(400).json({ success: false, message: 'mealId is required' });
    }

    const user = await User.findById(req.user._id);

    // Check if already in favorites
    const exists = user.favorites.some((fav) => fav.mealId === mealId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Meal already exists in your favorites',
      });
    }

    // If metadata was not supplied in body, look it up
    let name = mealName;
    let thumb = mealThumb;
    let cat = category;
    let ar = area;
    let ings = ingredients;

    if (!name || !cat) {
      const fetchedMeal = await mealDbService.getMealById(mealId);
      if (fetchedMeal) {
        name = name || fetchedMeal.strMeal;
        thumb = thumb || fetchedMeal.strMealThumb;
        cat = cat || fetchedMeal.strCategory;
        ar = ar || fetchedMeal.strArea;
        ings = ings || fetchedMeal.extractedIngredients?.map((i) => i.name) || [];
      }
    }

    user.favorites.unshift({
      mealId,
      mealName: name || 'Meal ' + mealId,
      mealThumb: thumb || '',
      category: cat || '',
      area: ar || '',
      ingredients: ings || [],
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Meal added to favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/favorites/:mealId
 * @desc    Remove meal from favorites
 * @access  Private
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { mealId } = req.params;

    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter((fav) => fav.mealId !== mealId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Meal removed from favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/history
 * @desc    Get user's search history
 * @access  Private
 */
const getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      count: user.history.length,
      history: user.history.slice(-30).reverse(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/history
 * @desc    Add a search record to history
 * @access  Private
 */
const addHistory = async (req, res, next) => {
  try {
    const { query, searchType, ingredients } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          history: {
            $each: [{ query, searchType: searchType || 'name', ingredients: ingredients || [] }],
            $slice: -50,
          },
        },
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      history: user.history.slice(-30).reverse(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/history
 * @desc    Clear user's search history
 * @access  Private
 */
const clearHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.history = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Search history cleared',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/recommendations
 * @desc    Get personalized meal recommendations based on favorites and history
 * @access  Private
 */
const getRecommendations = async (req, res, next) => {
  try {
    const data = await recommendationService.getRecommendationsForUser(req.user._id);
    return res.status(200).json({
      success: true,
      count: data.recommendations.length,
      preferences: data.preferences,
      recommendations: data.recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  getHistory,
  addHistory,
  clearHistory,
  getRecommendations,
};
