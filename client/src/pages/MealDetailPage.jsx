import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Tag,
  MapPin,
  Youtube,
  ExternalLink,
  CheckSquare,
  Square,
  Sparkles,
  Share2,
} from 'lucide-react';
import { mealsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../components/Toast';

const MealDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  useEffect(() => {
    fetchMealDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchMealDetails = async () => {
    try {
      setLoading(true);
      const data = await mealsApi.getById(id);
      if (data.meal) {
        setMeal(data.meal);
      } else {
        showToast('Meal not found', 'error');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to load meal details:', err);
      showToast('Error loading meal recipe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleFavorite = async () => {
    if (!meal) return;
    const res = await toggleFavorite(meal);
    if (res.requireAuth) {
      showToast(res.message, 'info');
    } else if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Recipe URL copied to clipboard!', 'success');
  };

  if (loading) {
    return <LoadingSpinner text="Preparing recipe instructions..." size="lg" />;
  }

  if (!meal) return null;

  const favorited = isFavorite(meal.idMeal);
  const ingredients = meal.extractedIngredients || [];

  // Parse instructions into numbered steps
  const instructionsList = (meal.strInstructions || '')
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  // Extract YouTube ID if present
  let youtubeEmbedUrl = null;
  if (meal.strYoutube) {
    const match = meal.strYoutube.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (match && match[1]) {
      youtubeEmbedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#111827] bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm transition-all hover:bg-gray-50"
            title="Share Recipe"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
              favorited
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white border border-gray-200 text-gray-700 hover:text-red-500 hover:border-red-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            <span>{favorited ? 'Saved to Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Meal Photo */}
          <div className="relative aspect-square md:aspect-auto h-72 md:h-full max-h-[420px] overflow-hidden bg-gray-100">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meal Info */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {meal.strCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B35] font-bold text-xs border border-orange-100">
                    <Tag className="w-3.5 h-3.5" />
                    {meal.strCategory}
                  </span>
                )}
                {meal.strArea && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    {meal.strArea} Cuisine
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111827] tracking-tight">
                {meal.strMeal}
              </h1>

              {meal.strTags && (
                <p className="text-xs text-gray-400 font-medium">
                  Tags: {meal.strTags.split(',').join(', ')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-gray-400 font-semibold block">Total Ingredients</span>
                <span className="text-lg font-black text-[#111827]">
                  {ingredients.length} items
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="text-gray-400 font-semibold block">Preparation</span>
                <span className="text-lg font-black text-[#111827]">
                  {instructionsList.length} steps
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Ingredients Checklist + Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients Checklist (1 Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <span>Ingredients</span>
                <span className="text-xs bg-orange-100 text-[#FF6B35] px-2 py-0.5 rounded-full font-extrabold">
                  {ingredients.length}
                </span>
              </h2>
              <span className="text-[11px] text-gray-400">Click to check off</span>
            </div>

            <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {ingredients.map((item, index) => {
                const isChecked = !!checkedIngredients[index];
                return (
                  <li
                    key={index}
                    onClick={() => toggleCheck(index)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer select-none transition-all text-xs ${
                      isChecked
                        ? 'bg-emerald-50 text-emerald-800 line-through opacity-70'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <button className="mt-0.5 text-gray-400 hover:text-emerald-600 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                    <div className="flex-1">
                      <span className="font-bold capitalize">{item.name}</span>
                      {item.measure && (
                        <span className="text-gray-400 block font-normal text-[11px]">
                          {item.measure}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Step-by-Step Instructions (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-[#111827]">
                Cooking Instructions
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Follow these step-by-step instructions to prepare this delicious meal.
              </p>
            </div>

            <div className="space-y-4">
              {instructionsList.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <span className="w-7 h-7 rounded-xl bg-orange-50 text-[#FF6B35] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Video Guide (if available) */}
          {youtubeEmbedUrl && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                Video Tutorial
              </h3>
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-md">
                <iframe
                  src={youtubeEmbedUrl}
                  title={`${meal.strMeal} Video Tutorial`}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetailPage;
