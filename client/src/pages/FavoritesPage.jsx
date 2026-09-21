import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Sparkles, ChefHat, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import MealCard from '../components/MealCard';

const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const { favorites, loadingFavorites } = useFavorites();
  const [filterQuery, setFilterQuery] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#111827]">
            Sign in to access your Favorites
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Save your favorite recipes to easily revisit them anytime and get personalized recommendations.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/auth"
            className="px-6 py-3 bg-[#FF6B35] hover:bg-[#E8531D] text-white font-bold rounded-2xl shadow-md transition-all text-sm"
          >
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-all text-sm"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  const filteredFavorites = favorites.filter((fav) =>
    (fav.mealName || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-xs font-bold text-red-600 mb-2">
            <Heart className="w-3.5 h-3.5 fill-current" />
            MY SAVED COLLECTION
          </div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">
            Favorite Recipes
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            You have {favorites.length} saved meal{favorites.length === 1 ? '' : 's'}.
          </p>
        </div>

        {favorites.length > 0 && (
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6B35] hover:bg-orange-100 font-extrabold text-xs shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>See Recommendations Based on Favorites</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Filter / Search input within favorites */}
      {favorites.length > 0 && (
        <div className="max-w-md relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search within your saved recipes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#FF6B35]"
          />
        </div>
      )}

      {/* Grid of Favorites */}
      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <ChefHat className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800">No favorite recipes yet</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Explore recipes and click the heart icon on any recipe to save it here.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white text-xs font-bold rounded-2xl shadow-md hover:bg-[#E8531D] transition-all"
          >
            <span>Explore Discovery Recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl p-6">
          <p className="text-sm font-semibold text-gray-600">
            No favorites match "{filterQuery}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFavorites.map((fav) => (
            <MealCard
              key={fav.mealId}
              meal={{
                idMeal: fav.mealId,
                strMeal: fav.mealName,
                strMealThumb: fav.mealThumb,
                strCategory: fav.category,
                strArea: fav.area,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
