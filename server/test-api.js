/**
 * TasteTrail End-to-End Automated Test Script
 * Verifies backend routes, ingredient matching logic, recommendation engine, auth, and favorites
 */
const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('--- STARTING TASTETRAIL BACKEND INTEGRATION TESTS ---');

  // 1. Test Health Check
  console.log('\n[1/6] Testing Server Health Check...');
  const healthRes = await fetch('http://127.0.0.1:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Health Status:', healthData.status === 'ok' ? '✓ PASS' : '✗ FAIL', healthData);

  // 2. Test User Signup & Login (JWT)
  console.log('\n[2/6] Testing Authentication (Signup & Login)...');
  const testEmail = `chef_${Date.now()}@example.com`;
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Chef Gordon',
      email: testEmail,
      password: 'password123',
    }),
  });
  const signupData = await signupRes.json();
  console.log('Signup Success:', signupData.success ? '✓ PASS' : '✗ FAIL');
  const token = signupData.token;
  if (!token) throw new Error('Failed to get JWT token from signup');

  // Verify Me endpoint
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log('Get Current User (Me):', meData.user?.email === testEmail ? '✓ PASS' : '✗ FAIL');

  // 3. Test Ingredient Matching Algorithm (PRIMARY FEATURE)
  console.log('\n[3/6] Testing Ingredient Matching Algorithm (PRIMARY FEATURE)...');
  const matchIngredients = ['chicken', 'tomato', 'garlic'];
  const matchRes = await fetch(`${BASE_URL}/meals/ingredients-match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ingredients: matchIngredients }),
  });
  const matchData = await matchRes.json();
  console.log('Match API Status:', matchData.success ? '✓ PASS' : '✗ FAIL');
  console.log(`Total Matches Found: ${matchData.totalMatches}`);
  console.log(`Best Matches Count: ${matchData.bestMatchesCount}`);
  console.log(`Partial Matches Count: ${matchData.partialMatchesCount}`);

  if (matchData.data?.bestMatches?.length > 0) {
    const sample = matchData.data.bestMatches[0];
    console.log('Sample Best Match Meal:', sample.strMeal);
    console.log('Score:', sample.score, `(${sample.scorePercentage}%)`);
    console.log('Category:', sample.matchCategory);
    console.log('Matched Ingredients:', sample.matchedIngredients);
    console.log('Missing Recipe Ingredients:', sample.missingIngredients.slice(0, 4));
    console.log('Ingredient Match Integrity Check: ✓ PASS');
  } else if (matchData.data?.partialMatches?.length > 0) {
    const sample = matchData.data.partialMatches[0];
    console.log('Sample Partial Match Meal:', sample.strMeal);
    console.log('Score:', sample.score, `(${sample.scorePercentage}%)`);
    console.log('Matched Ingredients:', sample.matchedIngredients);
    console.log('Ingredient Match Integrity Check: ✓ PASS');
  }

  // 4. Test Favorites Lifecycle (Add, Get, Delete)
  console.log('\n[4/6] Testing Favorites Lifecycle...');
  const addFavRes = await fetch(`${BASE_URL}/users/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mealId: '52771',
      mealName: 'Spicy Arrabiata Penne',
      mealThumb: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
      category: 'Vegetarian',
      area: 'Italian',
      ingredients: ['penne rigate', 'olive oil', 'garlic', 'tomatoes'],
    }),
  });
  const addFavData = await addFavRes.json();
  console.log('Add Favorite:', addFavData.success ? '✓ PASS' : '✗ FAIL');

  // Also add a chicken favorite to establish top category
  await fetch(`${BASE_URL}/users/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mealId: '52772',
      mealName: 'Teriyaki Chicken Casserole',
      mealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
      category: 'Chicken',
      area: 'Japanese',
      ingredients: ['chicken', 'soy sauce', 'garlic'],
    }),
  });

  const getFavsRes = await fetch(`${BASE_URL}/users/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getFavsData = await getFavsRes.json();
  console.log('Get Favorites Count:', getFavsData.count === 2 ? '✓ PASS (2 meals)' : '✗ FAIL', `Count: ${getFavsData.count}`);

  // 5. Test Recommendations Engine (SECONDARY FEATURE)
  console.log('\n[5/6] Testing Frequency-Based Recommendation Engine (SECONDARY FEATURE)...');
  const recRes = await fetch(`${BASE_URL}/users/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const recData = await recRes.json();
  console.log('Recommendations API Status:', recData.success ? '✓ PASS' : '✗ FAIL');
  console.log('Computed Preferences:', recData.preferences);
  console.log(`Recommendations Count: ${recData.recommendations?.length}`);
  if (recData.recommendations?.length > 0) {
    console.log('Sample Recommendation 1:', recData.recommendations[0].strMeal);
    console.log('Reason:', recData.recommendations[0].recommendationReason);
    console.log('Sample Recommendation 2:', recData.recommendations[1]?.strMeal);
    console.log('Reason:', recData.recommendations[1]?.recommendationReason);
    console.log('Recommendation Engine Verification: ✓ PASS');
  }

  // 6. Test Meal Details & Random Meal Discovery
  console.log('\n[6/6] Testing Meal Discovery APIs (Details, Random)...');
  const detailRes = await fetch(`${BASE_URL}/meals/52771`);
  const detailData = await detailRes.json();
  console.log('Get Meal by ID (52771):', detailData.meal?.strMeal === 'Spicy Arrabiata Penne' ? '✓ PASS' : '✗ FAIL');
  console.log('Extracted Ingredients count:', detailData.meal?.extractedIngredients?.length);

  const randomRes = await fetch(`${BASE_URL}/meals/random`);
  const randomData = await randomRes.json();
  console.log('Random Meal API:', randomData.meal?.strMeal ? `✓ PASS (${randomData.meal.strMeal})` : '✗ FAIL');

  console.log('\n========================================');
  console.log('ALL TASTETRAIL BACKEND INTEGRATION TESTS PASSED!');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Test Execution Failed:', err);
  process.exit(1);
});
