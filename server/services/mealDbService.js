const NodeCache = require('node-cache');

// In-memory cache with 1-hour TTL (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const BASE_URL = process.env.THEMEALDB_API_URL || 'https://www.themealdb.com/api/json/v1/1';

/**
 * Helper to fetch JSON from TheMealDB with built-in caching
 */
const fetchWithCache = async (url, cacheKey, ttl = 3600) => {
  if (cacheKey && cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TheMealDB request failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (cacheKey) {
      cache.set(cacheKey, data, ttl);
    }
    return data;
  } catch (error) {
    console.error(`[TheMealDB Service Error] ${url}:`, error.message);
    throw error;
  }
};

/**
 * Extract ingredients and measurements from a raw TheMealDB meal object
 * TheMealDB stores ingredients in strIngredient1..strIngredient20
 */
const extractIngredients = (meal) => {
  if (!meal) return [];
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (name && typeof name === 'string' && name.trim()) {
      ingredients.push({
        name: name.trim(),
        measure: measure && typeof measure === 'string' ? measure.trim() : '',
      });
    }
  }

  return ingredients;
};

/**
 * Search meals by name
 */
const searchByName = async (query = '') => {
  const url = `${BASE_URL}/search.php?s=${encodeURIComponent(query.trim())}`;
  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const data = await fetchWithCache(url, cacheKey, 600);
  return data.meals || [];
};

/**
 * Get meal details by ID
 */
const getMealById = async (id) => {
  if (!id) return null;
  const url = `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`;
  const cacheKey = `meal_${id}`;
  const data = await fetchWithCache(url, cacheKey, 86400); // 24h cache
  if (!data.meals || data.meals.length === 0) return null;
  
  const meal = data.meals[0];
  return {
    ...meal,
    extractedIngredients: extractIngredients(meal),
  };
};

/**
 * Get multiple meals by their IDs with parallel lookups and caching
 */
const getMultipleMealsByIds = async (ids = []) => {
  const uniqueIds = [...new Set(ids)];
  const promises = uniqueIds.map((id) => getMealById(id));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
};

/**
 * Get single random meal
 */
const getRandomMeal = async () => {
  const url = `${BASE_URL}/random.php`;
  // Do not cache random meal so each click brings a new surprise
  const data = await fetchWithCache(url, null);
  if (!data.meals || data.meals.length === 0) return null;

  const meal = data.meals[0];
  return {
    ...meal,
    extractedIngredients: extractIngredients(meal),
  };
};

/**
 * Filter meals by primary ingredient
 */
const filterByIngredient = async (ingredient) => {
  const cleaned = ingredient.trim().toLowerCase();
  const url = `${BASE_URL}/filter.php?i=${encodeURIComponent(cleaned)}`;
  const cacheKey = `filter_ing_${cleaned}`;
  const data = await fetchWithCache(url, cacheKey, 3600);
  return data.meals || [];
};

/**
 * Filter meals by category
 */
const filterByCategory = async (category) => {
  const cleaned = category.trim();
  const url = `${BASE_URL}/filter.php?c=${encodeURIComponent(cleaned)}`;
  const cacheKey = `filter_cat_${cleaned.toLowerCase()}`;
  const data = await fetchWithCache(url, cacheKey, 3600);
  return data.meals || [];
};

/**
 * Filter meals by area/cuisine
 */
const filterByArea = async (area) => {
  const cleaned = area.trim();
  const url = `${BASE_URL}/filter.php?a=${encodeURIComponent(cleaned)}`;
  const cacheKey = `filter_area_${cleaned.toLowerCase()}`;
  const data = await fetchWithCache(url, cacheKey, 3600);
  return data.meals || [];
};

/**
 * Get list of all meal categories
 */
const getCategories = async () => {
  const url = `${BASE_URL}/categories.php`;
  const cacheKey = 'all_categories';
  const data = await fetchWithCache(url, cacheKey, 86400);
  return data.categories || [];
};

/**
 * Get list of all areas / cuisines
 */
const getAreas = async () => {
  const url = `${BASE_URL}/list.php?a=list`;
  const cacheKey = 'all_areas';
  const data = await fetchWithCache(url, cacheKey, 86400);
  return data.meals || [];
};

module.exports = {
  searchByName,
  getMealById,
  getMultipleMealsByIds,
  getRandomMeal,
  filterByIngredient,
  filterByCategory,
  filterByArea,
  getCategories,
  getAreas,
  extractIngredients,
};
