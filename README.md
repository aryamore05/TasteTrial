# TasteTrail – Ingredient-Based Smart Food Discovery System

> A full-stack MERN application built for culinary discovery, pantry utilization, and personalized meal recommendations with a strong focus on clean backend logic.

---

## 🍽️ Overview

**TasteTrail** solves a daily kitchen dilemma: *"What can I cook with the random ingredients in my fridge?"*

Unlike generic recipe websites that only search by title, TasteTrail emphasizes **backend computational logic**:
1. **Ingredient Matching Algorithm (Primary Feature)**: Normalizes user pantry inputs, scores candidate meals based on input overlap, organizes them into **Best Match** vs. **Partial Match**, and itemizes missing ingredients.
2. **Frequency-Based Recommendation System (Secondary Feature)**: Aggregates user search history and saved favorites in MongoDB, computes category/cuisine/ingredient frequency distributions, and recommends meals with transparent, explainable reasons (without black-box ML).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend**: Node.js, Express.js (MVC Pattern)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Stateless JSON Web Tokens (JWT) with Bcrypt password hashing
- **External API**: [TheMealDB API](https://www.themealdb.com/api/json/v1/1/) with in-memory caching (`node-cache`)
- **Color Palette**:
  - Primary: `#FF6B35` (Tangerine Flame)
  - Secondary: `#1F2937` (Charcoal Slate)
  - Background: `#F9FAFB` (Canvas White)
  - Text: `#111827` (Deep Slate)

---

## 🧠 Core Backend Algorithms (Interview Deep Dive)

### 1. Ingredient Matching Algorithm (`server/services/matchingService.js`)

#### The Problem:
TheMealDB free API only filters recipes by a **single** ingredient (`filter.php?i=chicken`) and does not evaluate pantry coverage for multi-ingredient inputs.

#### The Solution:
1. **Input Normalization**:
   - Strips whitespace, converts strings to lowercase.
   - Cleans culinary modifiers: `"chopped"`, `"diced"`, `"fresh"`, `"boneless"`, `"cloves"`, etc.
   - Stems common English plurals (e.g. `"tomatoes"` &rarr; `"tomato"`, `"onions"` &rarr; `"onion"`).
2. **Candidate Discovery & Intersecting**:
   - Queries `filter.php?i={ingredient}` concurrently for each pantry ingredient.
   - Tallies how frequently candidate meal IDs appear across the different queries to prioritize recipes with multiple matching ingredients.
3. **Detail Retrieval & Caching**:
   - Lookups are cached in-memory with a 1-hour to 24-hour TTL using `node-cache`, ensuring sub-second response times and eliminating external API rate-limiting.
4. **Scoring Formula**:
   $$\text{Match Score} = \frac{|\text{Matched User Ingredients}|}{|\text{Total User Ingredients}|}$$
5. **Categorization**:
   - **Best Match**: Score $\ge 0.60$ (or $100\%$ match if 1 ingredient was entered).
   - **Partial Match**: $0 < \text{Score} < 0.60$.
6. **Detailed Breakdown Returned**:
   - `matchedIngredients`: Recipe items the user already has.
   - `missingIngredients`: Additional items required by the recipe that the user needs to shop for.
   - `unusedUserIngredients`: User inputs not required by this recipe.

---

### 2. Frequency-Based Recommendation System (`server/services/recommendationService.js`)

#### The Approach:
Instead of opaque machine learning models that are difficult to explain in interviews, TasteTrail uses a **transparent frequency-aggregation model**:

1. **User Signal Extraction**:
   - Examines the user's `favorites` and `history` stored in MongoDB.
   - Favorites receive a higher weight ($+2$) than search queries ($+1$).
2. **Frequency Counters**:
   - Tallies meal **categories** (e.g., Seafood: 6, Chicken: 4, Vegetarian: 1).
   - Tallies **cuisines/areas** (e.g., Italian: 5, Mexican: 3).
   - Tallies **pantry ingredients** searched in the Smart Match tool.
3. **Candidate Filtering & Novelty Guarantee**:
   - Fetches candidates matching the top category and cuisine.
   - Filters out dishes that are **already saved** in the user's favorites so the user always discovers new recipes.
4. **Explainable Reasoning**:
   - Attaches a human-readable tag to each recommendation:
     - *"Because you enjoy Italian cuisine"*
     - *"Because you frequently cook with Chicken"*
     - *"Trending discovery pick on TasteTrail"* (fallback for new accounts).

---

## 📁 Project Structure

```
TasteTrail/
├── package.json                   # Root package with concurrently scripts
├── .env.example                   # Example environment variables
├── README.md                      # Project documentation
│
├── server/                        # Express Backend
│   ├── .env                       # Server environment variables
│   ├── server.js                  # App entry point & middleware config
│   ├── test-api.js                # End-to-end automated integration tests
│   ├── config/
│   │   └── db.js                  # Mongoose MongoDB connection
│   ├── models/
│   │   └── User.js                # User schema (auth, favorites, search history)
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect & optionalAuth middleware
│   │   └── errorHandler.js        # Centralized HTTP error handler
│   ├── services/
│   │   ├── mealDbService.js       # TheMealDB client with TTL in-memory cache
│   │   ├── matchingService.js     # PRIMARY: Ingredient matching algorithm
│   │   └── recommendationService.js # SECONDARY: Recommendation engine
│   ├── controllers/
│   │   ├── authController.js      # Register, login, me
│   │   ├── mealController.js      # Search, details, random, matching
│   │   └── userController.js      # Favorites, history, recommendations
│   └── routes/
│       ├── authRoutes.js          # /api/auth
│       ├── mealRoutes.js          # /api/meals
│       └── userRoutes.js          # /api/users
│
└── client/                        # React Frontend (Vite)
    ├── vite.config.js             # Vite config with backend API proxy
    ├── tailwind.config.js         # Custom palette (#FF6B35, #1F2937, etc.)
    └── src/
        ├── App.jsx                # Main app layout & routing
        ├── main.jsx               # React DOM entry
        ├── context/
        │   ├── AuthContext.jsx    # User session & JWT state
        │   └── FavoritesContext.jsx # Optimistic favorites management
        ├── services/
        │   └── api.js             # Axios API client with JWT interceptor
        ├── components/
        │   ├── Navbar.jsx         # Responsive navigation header
        │   ├── MealCard.jsx       # Card supporting standard, match & rec modes
        │   ├── IngredientInput.jsx # Chip/tag input with pantry quick-picks
        │   ├── LoadingSpinner.jsx # Clean brand spinner
        │   └── Toast.jsx          # User notification system
        └── pages/
            ├── HomePage.jsx       # Search, category filters, random meal
            ├── SmartMatchPage.jsx # Dedicated primary feature matching page
            ├── MealDetailPage.jsx # Interactive ingredient checklist & steps
            ├── FavoritesPage.jsx  # Saved collection management
            ├── RecommendationsPage.jsx # Personalized recommendation discovery
            └── AuthPage.jsx       # Login & Signup forms
```

---

## 🔌 API Reference

### Authentication (`/api/auth`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user with bcrypt password | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & history | Bearer Token |

### Meals & Smart Matching (`/api/meals`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/meals/search?q=:name` | Search meals by recipe name | Public |
| `GET` | `/api/meals/random` | Get a random surprise meal | Public |
| `GET` | `/api/meals/categories` | List all available meal categories | Public |
| `GET` | `/api/meals/areas` | List all available world cuisines | Public |
| `GET` | `/api/meals/filter?category=:cat` | Filter recipes by category or cuisine | Public |
| `GET` | `/api/meals/:id` | Get full recipe details & ingredients | Public |
| `POST` | `/api/meals/ingredients-match` | **Run Ingredient Matching Algorithm** | Public / Optional |

### User Favorites & Recommendations (`/api/users`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/users/favorites` | Get user's saved favorite recipes | Bearer Token |
| `POST` | `/api/users/favorites` | Add a recipe to favorites | Bearer Token |
| `DELETE` | `/api/users/favorites/:mealId` | Remove a recipe from favorites | Bearer Token |
| `GET` | `/api/users/history` | Retrieve user search history | Bearer Token |
| `DELETE` | `/api/users/history` | Clear user search history | Bearer Token |
| `GET` | `/api/users/recommendations` | **Get Personalized Recommendations** | Bearer Token |

---

## 🚀 Quickstart & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 1. Clone & Install Dependencies
From the project root:
```bash
npm run install:all
```
*(Or individually install in `server/` and `client/` via `npm install`)*

### 2. Configure Environment Variables
Copy `.env.example` into `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/tastetrail?retryWrites=true&w=majority
JWT_SECRET=tastetrail_super_secret_jwt_key_2026
THEMEALDB_API_URL=https://www.themealdb.com/api/json/v1/1
CLIENT_URL=http://localhost:5173
```

### 3. Run Backend Integration Tests
To verify all algorithms, authentication, and API endpoints:
```bash
node server/test-api.js
```

### 4. Start the Application
To run both backend and frontend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:5000`

---
