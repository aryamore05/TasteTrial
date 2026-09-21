import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Dice5,
  Flame,
  Filter,
  ArrowRight,
  ChefHat,
  HeartHandshake,
} from 'lucide-react';
import { mealsApi } from '../services/api';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const POPULAR_CATEGORIES = [
  'All',
  'Chicken',
  'Vegetarian',
  'Pasta',
  'Seafood',
  'Beef',
  'Dessert',
  'Breakfast',
];

const POPULAR_AREAS = [
  'All',
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Japanese',
  'American',
  'French',
];

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomLoading, setRandomLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Load initial discover meals
  useEffect(() => {
    fetchInitialMeals();
  }, []);

  const fetchInitialMeals = async () => {
    try {
      setLoading(true);
      // Fetch popular chicken or general meals to populate home
      const data = await mealsApi.search('chicken');
      setMeals(data.meals?.slice(0, 12) || []);
    } catch (err) {
      console.error('Error fetching initial meals:', err);
      showToast('Could not load meals. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      fetchInitialMeals();
      return;
    }

    try {
      setLoading(true);
      setSelectedCategory('All');
      setSelectedArea('All');
      const data = await mealsApi.search(searchQuery.trim());
      setMeals(data.meals || []);
      if (!data.meals || data.meals.length === 0) {
        showToast(`No recipes found for "${searchQuery}"`, 'info');
      }
    } catch (err) {
      showToast('Search failed, please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (cat) => {
    setSelectedCategory(cat);
    setSelectedArea('All');
    setSearchQuery('');

    if (cat === 'All') {
      fetchInitialMeals();
      return;
    }

    try {
      setLoading(true);
      const data = await mealsApi.filter({ category: cat });
      setMeals(data.meals?.slice(0, 16) || []);
    } catch (err) {
      showToast('Failed to filter by category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSelect = async (area) => {
    setSelectedArea(area);
    setSelectedCategory('All');
    setSearchQuery('');

    if (area === 'All') {
      fetchInitialMeals();
      return;
    }

    try {
      setLoading(true);
      const data = await mealsApi.filter({ area });
      setMeals(data.meals?.slice(0, 16) || []);
    } catch (err) {
      showToast('Failed to filter by cuisine', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    try {
      setRandomLoading(true);
      const data = await mealsApi.getRandom();
      if (data.meal && data.meal.idMeal) {
        showToast(`Found: ${data.meal.strMeal}!`, 'success');
        navigate(`/meal/${data.meal.idMeal}`);
      }
    } catch (err) {
      showToast('Failed to fetch a random meal', 'error');
    } finally {
      setRandomLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 bg-gradient-to-b from-orange-50/70 via-white to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-extrabold text-[#FF6B35] mb-5 tracking-wide shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            SMART FOOD DISCOVERY SYSTEM
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111827] tracking-tight leading-tight max-w-4xl mx-auto">
            Cook with What You Have,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8A54]">
              Discover What You'll Love.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Find tasty recipes matching your pantry ingredients, minimize grocery waste,
            and enjoy transparent, interview-explainable recommendations.
          </p>

          {/* Quick Actions Row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto">
            <Link
              to="/smart-match"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FF6B35] hover:bg-[#E8531D] text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Try Ingredient Matcher
            </Link>

            <button
              onClick={handleSurpriseMe}
              disabled={randomLoading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 text-[#1F2937] font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            >
              <Dice5 className={`w-4 h-4 text-[#FF6B35] ${randomLoading ? 'animate-spin' : ''}`} />
              {randomLoading ? 'Rolling the dice...' : 'Surprise Me! (Random)'}
            </button>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto relative flex items-center shadow-lg shadow-gray-200/50 rounded-2xl bg-white border border-gray-200/80 p-1.5 focus-within:border-[#FF6B35] focus-within:ring-4 focus-within:ring-orange-500/10 transition-all"
          >
            <Search className="w-5 h-5 text-gray-400 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes by title (e.g., Lasagna, Curry, Pancakes)..."
              className="w-full px-3 py-2.5 text-sm font-medium bg-transparent focus:outline-none text-[#111827]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1F2937] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Primary Feature Highlight Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1F2937] via-[#243042] to-[#1F2937] text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-xs font-bold text-[#FF8A54]">
                <Sparkles className="w-3.5 h-3.5" />
                PRIMARY INTERVIEW FEATURE
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Got leftover ingredients? Let Smart Match decide.
              </h2>
              <p className="text-sm text-gray-300">
                Enter ingredients like "chicken, tomato, onion". Our normalized ranking
                computes exact match scores, groups recipes into Best vs Partial matches,
                and reveals what grocery items you still need.
              </p>
            </div>

            <Link
              to="/smart-match"
              className="px-6 py-3.5 bg-[#FF6B35] hover:bg-[#E8531D] text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 group hover:scale-105"
            >
              <span>Launch Matcher</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Discovery Section with Category & Cuisine Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-[#111827] tracking-tight">
              Explore Meal Discovery
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Browse recipe collections by category or world cuisines.
            </p>
          </div>

          <span className="text-xs font-bold text-gray-600">
            Showing {meals.length} recipes
          </span>
        </div>

        {/* Filter Pills */}
        <div className="space-y-3">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cuisines */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Cuisine:
            </span>
            {POPULAR_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => handleAreaSelect(area)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  selectedArea === area
                    ? 'bg-[#1F2937] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Cards Grid */}
        {loading ? (
          <LoadingSpinner text="Fetching recipes..." />
        ) : meals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
            <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No recipes matched your search</h3>
            <p className="text-xs text-gray-500 mt-1">Try another search keyword or clear filters.</p>
            <button
              onClick={fetchInitialMeals}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold"
            >
              Reset to Popular
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
