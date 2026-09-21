import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const data = await usersApi.getFavorites();
      if (data.success) {
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.warn('Failed to load favorites:', err.message);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const isFavorite = (mealId) => {
    return favorites.some((fav) => String(fav.mealId) === String(mealId));
  };

  const toggleFavorite = async (meal) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true, message: 'Please log in to save favorites' };
    }

    const mealId = meal.idMeal || meal.mealId;
    const exists = isFavorite(mealId);

    try {
      if (exists) {
        // Optimistic remove
        setFavorites((prev) => prev.filter((f) => String(f.mealId) !== String(mealId)));
        await usersApi.removeFavorite(mealId);
        return { success: true, action: 'removed', message: 'Removed from favorites' };
      } else {
        // Prepare favorite payload
        const payload = {
          mealId,
          mealName: meal.strMeal || meal.mealName,
          mealThumb: meal.strMealThumb || meal.mealThumb || '',
          category: meal.strCategory || meal.category || '',
          area: meal.strArea || meal.area || '',
          ingredients: meal.extractedIngredients?.map((i) => i.name) || meal.ingredients || [],
        };
        // Optimistic add
        setFavorites((prev) => [payload, ...prev]);
        const res = await usersApi.addFavorite(payload);
        if (res.favorites) {
          setFavorites(res.favorites);
        }
        return { success: true, action: 'added', message: 'Added to favorites!' };
      }
    } catch (err) {
      // Revert on error
      await fetchFavorites();
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update favorites',
      };
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loadingFavorites,
        isFavorite,
        toggleFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
