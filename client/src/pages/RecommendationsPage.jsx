import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Lightbulb,
  Heart,
  TrendingUp,
  Tag,
  MapPin,
  Flame,
  Lock,
  RefreshCw,
  Info,
} from 'lucide-react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const RecommendationsPage = () => {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getRecommendations();
      if (data.success) {
        setRecommendations(data.recommendations || []);
        setPreferences(data.preferences || null);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      showToast('Could not load recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto shadow-sm">
          <Lightbulb className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#111827]">
            Personalized Taste Recommendations
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Log in to view recipes tailored to your favorite categories, cuisines, and frequently searched pantry staples.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/auth"
            className="px-6 py-3 bg-[#FF6B35] hover:bg-[#E8531D] text-white font-bold rounded-2xl shadow-md transition-all text-sm"
          >
            Sign In to Unlock
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-all text-sm"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-xs font-black text-[#FF6B35] mb-2 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            SECONDARY CORE FEATURE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
            Personalized Recommendations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Frequency-based suggestions tuned to your activity, favorites, and search habits.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-orange-300 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FF6B35] ${loading ? 'animate-spin' : ''}`} />
          Refresh Suggestions
        </button>
      </div>

      {/* User Preferences Summary Card */}
      {preferences && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#FF6B35]" />
            <h2 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider">
              Your Taste Frequency Profile
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                Top Category
              </span>
              <span className="text-sm font-black text-[#FF6B35] capitalize">
                {preferences.topCategory}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                Top Cuisine
              </span>
              <span className="text-sm font-black text-[#111827] capitalize">
                {preferences.topCuisine}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                Frequent Ingredient
              </span>
              <span className="text-sm font-black text-[#111827] capitalize">
                {preferences.topIngredient}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-1">
                Tracked Signals
              </span>
              <span className="text-sm font-black text-gray-700">
                {preferences.favoritesCount} favs &bull; {preferences.historyCount} searches
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-600">
            <Info className="w-3.5 h-3.5 text-[#FF6B35] shrink-0" />
            <span>
              <strong>Interview Explainer:</strong> Frequencies are tallied across your MongoDB favorites collection & search history without black-box ML, ensuring transparent, deterministic recommendations.
            </span>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {loading ? (
        <LoadingSpinner text="Computing taste recommendations..." size="lg" />
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-gray-800">No suggestions yet</h3>
          <p className="text-xs text-gray-500">
            Save a few meals to your favorites or try the Smart Match feature to build your taste profile!
          </p>
          <Link
            to="/smart-match"
            className="inline-block mt-2 px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Try Smart Match
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111827]">
              Recommended for You
            </h2>
            <span className="text-xs font-bold text-gray-600">
              {recommendations.length} dishes recommended
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((meal) => (
              <MealCard
                key={meal.idMeal}
                meal={meal}
                recommendationReason={meal.recommendationReason}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
