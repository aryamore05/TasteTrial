import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  HelpCircle,
  ChefHat,
  ArrowRight,
} from 'lucide-react';
import IngredientInput from '../components/IngredientInput';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { mealsApi } from '../services/api';
import { useToast } from '../components/Toast';

const SmartMatchPage = () => {
  const [ingredients, setIngredients] = useState(['Chicken', 'Tomato', 'Garlic']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'best' | 'partial'
  const [showFormula, setShowFormula] = useState(false);
  const { showToast } = useToast();

  const handleAddIngredient = (item) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    const exists = ingredients.some(
      (i) => i.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      showToast(`"${trimmed}" is already in your ingredient list`, 'info');
      return;
    }
    setIngredients((prev) => [...prev, trimmed]);
  };

  const handleRemoveIngredient = (item) => {
    setIngredients((prev) =>
      prev.filter((i) => i.toLowerCase() !== item.toLowerCase())
    );
  };

  const handleClearIngredients = () => {
    setIngredients([]);
    setResults(null);
  };

  const handleMatchSearch = async () => {
    if (ingredients.length === 0) {
      showToast('Please add at least one ingredient', 'info');
      return;
    }

    try {
      setLoading(true);
      const res = await mealsApi.matchIngredients(ingredients);
      if (res.success && res.data) {
        setResults(res.data);
        setActiveTab('all');
        if (res.data.totalMatches === 0) {
          showToast('No meals found matching these ingredients. Try adding staples like garlic, tomato, or rice.', 'info');
        } else {
          showToast(
            `Found ${res.data.totalMatches} matches (${res.data.bestMatches.length} Best Matches)!`,
            'success'
          );
        }
      }
    } catch (err) {
      console.error('Match error:', err);
      showToast(err.response?.data?.message || 'Failed to match ingredients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const allMatches = results
    ? [...results.bestMatches, ...results.partialMatches]
    : [];

  const displayedMeals =
    activeTab === 'best'
      ? results?.bestMatches || []
      : activeTab === 'partial'
      ? results?.partialMatches || []
      : allMatches;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-xs font-black text-[#FF6B35] tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          PRIMARY CORE FEATURE
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827] tracking-tight">
          Smart Ingredient Matcher
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Enter what you have at home. Our backend algorithm normalizes your ingredients,
          scores candidate recipes, and organizes them by match accuracy.
        </p>

        {/* Algorithm formula toggle button */}
        <div className="pt-2">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#FF6B35] transition-colors bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showFormula ? 'Hide Algorithm Breakdown' : 'How does the Matching Logic work?'}
          </button>
        </div>
      </div>

      {/* Algorithm Explainer Box (Collapsible / Expandable) */}
      {showFormula && (
        <div className="bg-white rounded-3xl p-6 border border-orange-200 shadow-md shadow-orange-500/5 space-y-4 animate-fade-in max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-[#111827] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]"></span>
              Backend Matching & Scoring Architecture
            </h3>
            <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              matchingService.js
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#FF6B35] block">1. Normalization</span>
              <p className="text-gray-600 leading-relaxed">
                Inputs are lowercased, trimmed, and stemmed (e.g. <em>"tomatoes"</em> &rarr; <em>"tomato"</em>), removing culinary modifiers like <em>"chopped"</em> or <em>"fresh"</em>.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#FF6B35] block">2. Candidate Discovery</span>
              <p className="text-gray-600 leading-relaxed">
                Concurrent lookups fetch candidate meal lists from TheMealDB. Candidate frequency is tallies to find recipes with multi-ingredient overlaps.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#FF6B35] block">3. Scoring & Categorization</span>
              <p className="text-gray-600 leading-relaxed font-mono font-medium">
                score = matched_user_ingredients / total_user_ingredients
              </p>
              <p className="text-gray-600">
                Categorized into <strong>Best Match (&ge; 60%)</strong> vs <strong>Partial Match</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredient Tag Input Section */}
      <div className="max-w-4xl mx-auto">
        <IngredientInput
          ingredients={ingredients}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onClearIngredients={handleClearIngredients}
          onSearch={handleMatchSearch}
          isLoading={loading}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <LoadingSpinner
          text="Running ingredient matching algorithm across TheMealDB..."
          size="lg"
        />
      )}

      {/* Results Section */}
      {!loading && results && (
        <div className="space-y-6 pt-4">
          {/* Summary Metric Header */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#111827]">
                Smart Match Results
              </h2>
              <p className="text-xs text-gray-500">
                Based on your {results.inputIngredients?.length} pantry ingredient
                {results.inputIngredients?.length === 1 ? '' : 's'}:{' '}
                <span className="font-semibold text-gray-800">
                  {results.inputIngredients?.join(', ')}
                </span>
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-gray-600 hover:text-[#111827]'
                }`}
              >
                All ({allMatches.length})
              </button>
              <button
                onClick={() => setActiveTab('best')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'best'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                Best Matches ({results.bestMatches?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('partial')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'partial'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Partial ({results.partialMatches?.length || 0})
              </button>
            </div>
          </div>

          {/* Empty Search Results */}
          {displayedMeals.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-base text-gray-800">No meals in this category</h3>
              <p className="text-xs text-gray-500">
                Switch to another tab or add more common ingredients like garlic, tomato, or onion.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-bold rounded-xl"
              >
                Show All Matches
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedMeals.map((meal) => (
                <MealCard key={meal.idMeal} meal={meal} matchMode={true} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartMatchPage;
