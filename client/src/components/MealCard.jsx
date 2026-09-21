import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Check, Plus, Utensils, MapPin, Tag } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from './Toast';

const MealCard = ({ meal, matchMode = false, recommendationReason = null }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const mealId = meal.idMeal || meal.mealId;
  const mealName = meal.strMeal || meal.mealName;
  const mealThumb = meal.strMealThumb || meal.mealThumb;
  const category = meal.strCategory || meal.category;
  const area = meal.strArea || meal.area;

  const favorited = isFavorite(mealId);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const res = await toggleFavorite(meal);
    if (res.requireAuth) {
      showToast(res.message, 'info');
    } else if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <Link to={`/meal/${mealId}`}>
          <img
            src={mealThumb || 'https://via.placeholder.com/400x260?text=Delicious+Food'}
            alt={mealName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
            favorited
              ? 'bg-red-500 text-white hover:bg-red-600 scale-105'
              : 'bg-white/85 text-gray-700 hover:bg-white hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Match Score Badge (if in Smart Match mode) */}
        {matchMode && meal.scorePercentage !== undefined && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-md backdrop-blur-md ${
                meal.matchCategory === 'Best Match'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}
            >
              {meal.scorePercentage}% Match
            </span>
          </div>
        )}

        {/* Category & Cuisine Chips */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          {category && (
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#FF8A54]" />
              {category}
            </span>
          )}
          {area && (
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF8A54]" />
              {area}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Recommendation Reason Banner */}
          {(recommendationReason || meal.recommendationReason) && (
            <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-xs font-semibold text-[#FF6B35]">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{recommendationReason || meal.recommendationReason}</span>
            </div>
          )}

          {/* Title */}
          <Link to={`/meal/${mealId}`}>
            <h3 className="font-bold text-base text-[#111827] line-clamp-1 group-hover:text-[#FF6B35] transition-colors">
              {mealName}
            </h3>
          </Link>

          {/* Ingredient Details for Smart Match Mode */}
          {matchMode && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
              {/* Matched Ingredients */}
              {meal.matchedIngredients && meal.matchedIngredients.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-gray-500 mb-1 font-medium">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Matched ({meal.matchedIngredients.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {meal.matchedIngredients.slice(0, 4).map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize font-medium text-[11px]"
                      >
                        {ing}
                      </span>
                    ))}
                    {meal.matchedIngredients.length > 4 && (
                      <span className="px-1.5 py-0.5 text-gray-500 text-[11px] font-medium self-center">
                        +{meal.matchedIngredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Missing Ingredients */}
              {meal.missingIngredients && meal.missingIngredients.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between text-gray-500 mb-1 font-medium">
                    <span className="text-gray-600 font-semibold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-orange-500" />
                      Missing from pantry ({meal.missingIngredients.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {meal.missingIngredients.slice(0, 3).map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 capitalize font-medium text-[11px]"
                      >
                        {ing}
                      </span>
                    ))}
                    {meal.missingIngredients.length > 3 && (
                      <span className="px-1.5 py-0.5 text-gray-400 text-[11px] font-medium self-center">
                        +{meal.missingIngredients.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View Details Action */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-600 font-medium">Ready to cook?</span>
          <Link
            to={`/meal/${mealId}`}
            className="text-xs font-bold text-[#FF6B35] hover:text-[#E8531D] flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
          >
            View Recipe &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
