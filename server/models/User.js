const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FavoriteSchema = new mongoose.Schema(
  {
    mealId: {
      type: String,
      required: true,
    },
    mealName: {
      type: String,
      required: true,
    },
    mealThumb: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    area: {
      type: String,
      default: '',
    },
    ingredients: {
      type: [String],
      default: [],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const SearchHistorySchema = new mongoose.Schema(
  {
    query: {
      type: String,
      default: '',
    },
    searchType: {
      type: String,
      enum: ['name', 'ingredients', 'category', 'cuisine'],
      default: 'name',
    },
    ingredients: {
      type: [String],
      default: [],
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    favorites: {
      type: [FavoriteSchema],
      default: [],
    },
    history: {
      type: [SearchHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify candidate password during login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
