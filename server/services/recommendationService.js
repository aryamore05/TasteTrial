const mealDbService = require('./mealDbService');
const User = require('../models/User');

/**
 * Frequency-based Recommendation Engine:
 * 1. Analyzes user's saved favorites and search history
 * 2. Tallies frequency distribution of:
 *    - Categories (e.g., Seafood, Vegetarian, Chicken)
 *    - Cuisines / Areas (e.g., Italian, Mexican, Indian)
 *    - Ingredients used in previous pantry searches
 * 3. Extracts top preferences based on highest frequencies
 * 4. Fetches candidate meals from TheMealDB matching those top preferences
 * 5. Excludes meals already saved in the user's favorites
 * 6. Adds a transparent, human-readable reason for each recommendation
 * 7. Falls back to curated trending meals if the user is new or has no activity
 */
const getRecommendationsForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const userFavorites = user.favorites || [];
  const userHistory = user.history || [];
  const favoriteMealIds = new Set(userFavorites.map((fav) => fav.mealId));

  // Step 1: Frequency Counters
  const categoryCounts = {};
  const cuisineCounts = {};
  const ingredientCounts = {};

  // Analyze favorites
  userFavorites.forEach((fav) => {
    if (fav.category) {
      categoryCounts[fav.category] = (categoryCounts[fav.category] || 0) + 2; // Extra weight for favorites
    }
    if (fav.area) {
      cuisineCounts[fav.area] = (cuisineCounts[fav.area] || 0) + 2;
    }
    if (Array.isArray(fav.ingredients)) {
      fav.ingredients.forEach((ing) => {
        const cleaned = ing.toLowerCase().trim();
        if (cleaned) {
          ingredientCounts[cleaned] = (ingredientCounts[cleaned] || 0) + 1;
        }
      });
    }
  });

  // Analyze search history
  userHistory.forEach((item) => {
    if (item.searchType === 'category' && item.query) {
      categoryCounts[item.query] = (categoryCounts[item.query] || 0) + 1;
    } else if (item.searchType === 'cuisine' && item.query) {
      cuisineCounts[item.query] = (cuisineCounts[item.query] || 0) + 1;
    }

    if (Array.isArray(item.ingredients)) {
      item.ingredients.forEach((ing) => {
        const cleaned = ing.toLowerCase().trim();
        if (cleaned) {
          ingredientCounts[cleaned] = (ingredientCounts[cleaned] || 0) + 1;
        }
      });
    }
  });

  // Helper to find top key by frequency count
  const getTopKey = (counterObj) => {
    const sorted = Object.entries(counterObj).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0] : null;
  };

  const topCategoryPair = getTopKey(categoryCounts);
  const topCuisinePair = getTopKey(cuisineCounts);
  const topIngredientPair = getTopKey(ingredientCounts);

  const topCategory = topCategoryPair ? topCategoryPair[0] : null;
  const topCuisine = topCuisinePair ? topCuisinePair[0] : null;
  const topIngredient = topIngredientPair ? topIngredientPair[0] : null;

  const recommendations = [];
  const addedMealIds = new Set(favoriteMealIds);

  // Step 2: Fetch meals based on top preferences

  // 1. Fetch by top category
  if (topCategory) {
    try {
      const categoryMeals = await mealDbService.filterByCategory(topCategory);
      for (const meal of categoryMeals) {
        if (!addedMealIds.has(meal.idMeal)) {
          addedMealIds.add(meal.idMeal);
          recommendations.push({
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb,
            category: topCategory,
            recommendationReason: `Because you enjoy ${topCategory} dishes`,
            basedOn: 'category',
          });
        }
        if (recommendations.length >= 4) break;
      }
    } catch (err) {
      console.warn('[RecommendationService] Failed category fetch:', err.message);
    }
  }

  // 2. Fetch by top cuisine / area
  if (topCuisine) {
    try {
      const cuisineMeals = await mealDbService.filterByArea(topCuisine);
      for (const meal of cuisineMeals) {
        if (!addedMealIds.has(meal.idMeal)) {
          addedMealIds.add(meal.idMeal);
          recommendations.push({
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb,
            area: topCuisine,
            recommendationReason: `Because you love ${topCuisine} cuisine`,
            basedOn: 'cuisine',
          });
        }
        if (recommendations.length >= 8) break;
      }
    } catch (err) {
      console.warn('[RecommendationService] Failed cuisine fetch:', err.message);
    }
  }

  // 3. Fetch by top ingredient if more recommendations needed
  if (topIngredient && recommendations.length < 10) {
    try {
      const ingredientMeals = await mealDbService.filterByIngredient(topIngredient);
      for (const meal of ingredientMeals) {
        if (!addedMealIds.has(meal.idMeal)) {
          addedMealIds.add(meal.idMeal);
          recommendations.push({
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb,
            recommendationReason: `Features your frequent ingredient: ${topIngredient}`,
            basedOn: 'ingredient',
          });
        }
        if (recommendations.length >= 10) break;
      }
    } catch (err) {
      console.warn('[RecommendationService] Failed ingredient fetch:', err.message);
    }
  }

  // Step 3: Fallback if user is new or has very few recommendations
  if (recommendations.length < 6) {
    try {
      const fallbackMeals = await mealDbService.filterByCategory('Chicken');
      for (const meal of fallbackMeals) {
        if (!addedMealIds.has(meal.idMeal)) {
          addedMealIds.add(meal.idMeal);
          recommendations.push({
            idMeal: meal.idMeal,
            strMeal: meal.strMeal,
            strMealThumb: meal.strMealThumb,
            category: 'Chicken',
            recommendationReason: 'Popular discovery pick on TasteTrail',
            basedOn: 'trending',
          });
        }
        if (recommendations.length >= 10) break;
      }
    } catch (err) {
      console.warn('[RecommendationService] Failed fallback fetch:', err.message);
    }
  }

  return {
    recommendations,
    preferences: {
      topCategory: topCategory || 'None yet',
      topCuisine: topCuisine || 'None yet',
      topIngredient: topIngredient || 'None yet',
      favoritesCount: userFavorites.length,
      historyCount: userHistory.length,
    },
  };
};

module.exports = {
  getRecommendationsForUser,
};
