import React, { useState } from 'react';
import { Plus, X, Sparkles, Trash2 } from 'lucide-react';

const COMMON_PANTRY = [
  'Chicken',
  'Tomato',
  'Garlic',
  'Onion',
  'Rice',
  'Egg',
  'Potato',
  'Cheese',
  'Pasta',
  'Lemon',
  'Beef',
  'Mushroom',
  'Bell Pepper',
  'Carrot',
];

const IngredientInput = ({
  ingredients = [],
  onAddIngredient,
  onRemoveIngredient,
  onClearIngredients,
  onSearch,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCurrentValue();
    }
  };

  const addCurrentValue = () => {
    const trimmed = inputValue.trim().replace(/^,|,$/g, '');
    if (trimmed) {
      onAddIngredient(trimmed);
      setInputValue('');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-orange-500/5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B35] flex items-center justify-center text-sm font-black">
              1
            </span>
            What's in your kitchen?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Type pantry ingredients or click common suggestions below.
          </p>
        </div>

        {ingredients.length > 0 && (
          <button
            onClick={onClearIngredients}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Input box & Add Button */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. chicken breast, garlic, tomato, rice..."
            className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-500/10 text-sm font-medium transition-all outline-none"
          />
        </div>
        <button
          type="button"
          onClick={addCurrentValue}
          disabled={!inputValue.trim()}
          className="px-5 py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-40 disabled:hover:bg-gray-900 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Selected Ingredients Tag Cloud */}
      <div className="mt-5 min-h-[48px] p-3 rounded-2xl bg-[#F9FAFB] border border-gray-100 flex flex-wrap items-center gap-2">
        {ingredients.length === 0 ? (
          <span className="text-xs text-gray-400 italic px-2">
            No ingredients added yet. Add at least one to match recipes.
          </span>
        ) : (
          ingredients.map((ing, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF6B35] border border-orange-200 text-xs font-bold shadow-sm animate-fade-in"
            >
              <span className="capitalize">{ing}</span>
              <button
                type="button"
                onClick={() => onRemoveIngredient(ing)}
                className="hover:bg-orange-200/60 rounded-full p-0.5 text-orange-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Quick-Pick Popular Suggestions */}
      <div className="mt-5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
          Quick-select pantry staples:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PANTRY.map((item) => {
            const isSelected = ingredients.some(
              (i) => i.toLowerCase() === item.toLowerCase()
            );
            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  isSelected ? onRemoveIngredient(item) : onAddIngredient(item)
                }
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-[#1F2937] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-[#FF6B35]'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          <strong className="text-gray-900 font-semibold">{ingredients.length}</strong>{' '}
          ingredient{ingredients.length === 1 ? '' : 's'} ready for matching
        </div>
        <button
          type="button"
          onClick={onSearch}
          disabled={ingredients.length === 0 || isLoading}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FF8A54] hover:from-[#E8531D] hover:to-[#FF6B35] text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Running Smart Match...' : 'Find Matching Meals'}
        </button>
      </div>
    </div>
  );
};

export default IngredientInput;
