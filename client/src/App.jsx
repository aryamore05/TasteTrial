import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SmartMatchPage from './pages/SmartMatchPage';
import MealDetailPage from './pages/MealDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AuthPage from './pages/AuthPage';
import { UtensilsCrossed, Heart, Sparkles } from 'lucide-react';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827]">
              {/* Top Navigation Bar */}
              <Navbar />

              {/* Main Content Area */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/smart-match" element={<SmartMatchPage />} />
                  <Route path="/meal/:id" element={<MealDetailPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/recommendations" element={<RecommendationsPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                </Routes>
              </main>

              {/* Modern Minimal Footer */}
              <footer className="bg-white border-t border-gray-100 py-10 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center text-white">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-[#111827]">
                      Taste<span className="text-[#FF6B35]">Trail</span>
                    </span>
                    <span className="text-gray-400 text-xs">&bull; Ingredient-Based Smart Food Discovery</span>
                  </div>

                  <p className="text-xs text-gray-600">
                    Built with MERN Stack + TheMealDB API &bull; Interview-ready architecture
                  </p>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
