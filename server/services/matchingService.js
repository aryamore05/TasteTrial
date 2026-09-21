const mealDbService = require('./mealDbService');

/**
 * Common culinary preparation descriptors to strip during normalization
 * E.g., "chopped onions" -> "onion", "fresh garlic cloves" -> "garlic"
 */
const PREPARATION_WORDS = [
  'chopped', 'diced', 'minced', 'sliced', 'grated', 'peeled', 'crushed',
  'fresh', 'dried', 'ground', 'boneless', 'skinless', 'cooked', 'boiled',
  'roasted', 'fried', 'canned', 'tin of', 'can of', 'cup of', 'tablespoon of',
  'teaspoon of', 'handful of', 'pinch of', 'clove of', 'cloves of', 'cloves',
  'leaves', 'pieces', 'fillet', 'fillets', 'breasts', 'breast'
];

/**
 * Normalizes a single ingredient string:
 * - Trims whitespace & converts to lowercase
 * - Strips common preparation adjectives
 * - Stems common English plurals (e.g. tomatoes -> tomato, onions -> onion)
 */
const normalizeIngredient = (raw = '') => {
  if (!raw || typeof raw !== 'string') return '';

  let cleaned = raw.toLowerCase().trim();

  // Strip non-alphanumeric except spaces and hyphens
  cleaned = cleaned.replace(/[^a-z0-9\s-]/g, ' ');

  // Remove common culinary prefixes and suffixes
  for (const word of PREPARATION_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, ' ');
  }

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Simple singularization/stemming for food words
  if (cleaned.endsWith('ies')) {
    cleaned = cleaned.slice(0, -3) + 'y';
  } else if (cleaned.endsWith('es') && !cleaned.endsWith('ches') && !cleaned.endsWith('shes')) {
    cleaned = cleaned.slice(0, -2);
  } else if (cleaned.endsWith('s') && !cleaned.endsWith('ss')) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned.trim();
};

/**
 * Checks if a user ingredient matches a recipe ingredient
 * Uses token overlap and substring containment
 */
const isIngredientMatch = (userIngNorm, recipeIngRaw) => {
  const recipeIngNorm = normalizeIngredient(recipeIngRaw);

  if (!userIngNorm || !recipeIngNorm) return false;

  // 1. Direct equality
  if (userIngNorm === recipeIngNorm) return true;

  // 2. Substring containment (e.g. "tomato" in "plum tomato")
  if (recipeIngNorm.includes(userIngNorm) || userIngNorm.includes(recipeIngNorm)) {
    return true;
  }

  // 3. Word token matching (e.g., "red onion" vs "onion")
  const userTokens = userIngNorm.split(' ').filter(Boolean);
  const recipeTokens = recipeIngNorm.split(' ').filter(Boolean);

  return userTokens.some((uToken) => recipeTokens.includes(uToken));
};

/**
 * Core Ingredient Matching Algorithm:
 * 1. Takes user ingredients array
 * 2. Normalizes all user ingredients
 * 3. Queries TheMealDB to gather candidate meals across each ingredient
 * 4. Prioritizes candidate meals that appear across multiple ingredient filters
 * 5. Fetches full meal details (using cache where possible)
 * 6. Computes match score:
 *      score = matched_ingredients / total_user_ingredients
 * 7. Identifies matched ingredients and missing ingredients
 * 8. Categorizes into "Best Match" (high score) vs "Partial Match" (medium score)
 * 9. Returns ranked results
 */
const matchMealsByIngredients = async (rawIngredients = []) => {
  // Step 1: Normalize user inputs and filter duplicates
  const totalInputList = Array.isArray(rawIngredients) ? rawIngredients : [rawIngredients];
  const normalizedUserList = [
    ...new Set(
      totalInputList
        .map((ing) => normalizeIngredient(ing))
        .filter((ing) => ing.length > 1)
    ),
  ];

  if (normalizedUserList.length === 0) {
    return {
      bestMatches: [],
      partialMatches: [],
      totalMatches: 0,
      inputIngredients: [],
    };
  }

  const totalUserIngredients = normalizedUserList.length;

  // Step 2: Fetch candidate meals for each user ingredient
  // Concurrently query filter.php?i= for each input ingredient
  const candidateLists = await Promise.all(
    normalizedUserList.map(async (ing) => {
      try {
        const meals = await mealDbService.filterByIngredient(ing);
        return meals || [];
      } catch (err) {
        console.warn(`[MatchingService] Failed candidate fetch for '${ing}':`, err.message);
        return [];
      }
    })
  );

  // Step 3: Count candidate meal occurrences (frequency of intersection)
  const mealFrequencyMap = new Map();

  candidateLists.forEach((list) => {
    list.forEach((meal) => {
      if (!meal || !meal.idMeal) return;
      const count = mealFrequencyMap.get(meal.idMeal) || 0;
      mealFrequencyMap.set(meal.idMeal, count + 1);
    });
  });

  // Sort candidate meal IDs by frequency descending, take top candidates (up to 30)
  const candidateMealIds = [...mealFrequencyMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([id]) => id);

  // Step 4: Fetch full details for candidates (cached lookups)
  const fullCandidateMeals = await mealDbService.getMultipleMealsByIds(candidateMealIds);

  // Step 5: Evaluate each meal against the normalized user ingredients
  const scoredMeals = fullCandidateMeals.map((meal) => {
    const recipeIngredients = mealDbService.extractIngredients(meal);
    
    // Matched user ingredients
    const matchedUserIngs = new Set();
    // Matched recipe items
    const matchedRecipeItems = [];
    // Missing recipe items (required by recipe but not provided by user)
    const missingRecipeItems = [];

    recipeIngredients.forEach((item) => {
      let isMatched = false;

      for (const userIng of normalizedUserList) {
        if (isIngredientMatch(userIng, item.name)) {
          matchedUserIngs.add(userIng);
          isMatched = true;
          break;
        }
      }

      if (isMatched) {
        matchedRecipeItems.push(item);
      } else {
        missingRecipeItems.push(item);
      }
    });

    // Score = matched user ingredients / total user ingredients
    const matchedCount = matchedUserIngs.size;
    const score = totalUserIngredients > 0
      ? Number((matchedCount / totalUserIngredients).toFixed(2))
      : 0;
    const scorePercentage = Math.round(score * 100);

    // Identify user ingredients that were not used in this meal
    const unusedUserIngredients = normalizedUserList.filter(
      (userIng) => !matchedUserIngs.has(userIng)
    );

    // Recipe coverage = matched recipe ingredients / total recipe ingredients
    const recipeCoverage = recipeIngredients.length > 0
      ? Number((matchedRecipeItems.length / recipeIngredients.length).toFixed(2))
      : 0;

    // Step 6: Categorize into Best Match vs Partial Match
    // If user provided 1 ingredient: 100% match is Best Match
    // If user provided >= 2 ingredients: >= 60% match is Best Match
    const isBestMatch =
      totalUserIngredients === 1 ? score === 1 : score >= 0.6;
    const matchCategory = isBestMatch ? 'Best Match' : 'Partial Match';

    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
      strMealThumb: meal.strMealThumb,
      strInstructions: meal.strInstructions,
      strYoutube: meal.strYoutube,
      totalRecipeIngredients: recipeIngredients.length,
      matchedUserIngredientsCount: matchedCount,
      totalUserIngredients,
      score,
      scorePercentage,
      recipeCoverage,
      matchCategory,
      matchedIngredients: matchedRecipeItems.map((item) => item.name),
      missingIngredients: missingRecipeItems.map((item) => item.name),
      unusedUserIngredients,
      allRecipeIngredients: recipeIngredients,
    };
  });

  // Filter out any that had 0 matched ingredients
  const validMeals = scoredMeals.filter((m) => m.matchedUserIngredientsCount > 0);

  // Step 7: Rank meals based on score (descending), then recipe coverage descending
  validMeals.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.recipeCoverage - a.recipeCoverage;
  });

  // Separate into Best Matches and Partial Matches
  const bestMatches = validMeals.filter((m) => m.matchCategory === 'Best Match');
  const partialMatches = validMeals.filter((m) => m.matchCategory === 'Partial Match');

  return {
    bestMatches,
    partialMatches,
    totalMatches: validMeals.length,
    inputIngredients: normalizedUserList,
  };
};

module.exports = {
  normalizeIngredient,
  isIngredientMatch,
  matchMealsByIngredients,
};
