import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tastetrail_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear token
      // localStorage.removeItem('tastetrail_token');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (userData) => {
    const res = await api.post('/auth/signup', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const mealsApi = {
  search: async (query) => {
    const res = await api.get(`/meals/search?q=${encodeURIComponent(query || '')}`);
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/meals/${id}`);
    return res.data;
  },
  getRandom: async () => {
    const res = await api.get('/meals/random');
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/meals/categories');
    return res.data;
  },
  getAreas: async () => {
    const res = await api.get('/meals/areas');
    return res.data;
  },
  filter: async ({ category, area, ingredient }) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (area) params.append('area', area);
    if (ingredient) params.append('ingredient', ingredient);
    const res = await api.get(`/meals/filter?${params.toString()}`);
    return res.data;
  },
  matchIngredients: async (ingredients) => {
    const res = await api.post('/meals/ingredients-match', { ingredients });
    return res.data;
  },
};

export const usersApi = {
  getFavorites: async () => {
    const res = await api.get('/users/favorites');
    return res.data;
  },
  addFavorite: async (mealData) => {
    const res = await api.post('/users/favorites', mealData);
    return res.data;
  },
  removeFavorite: async (mealId) => {
    const res = await api.delete(`/users/favorites/${mealId}`);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/users/history');
    return res.data;
  },
  clearHistory: async () => {
    const res = await api.delete('/users/history');
    return res.data;
  },
  getRecommendations: async () => {
    const res = await api.get('/users/recommendations');
    return res.data;
  },
};

export default api;
