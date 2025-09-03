import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  preferences: {
    // Content preferences
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    tags: [{
      type: String,
      trim: true
    }],
    authors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    // Display preferences
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      enum: ['en', 'km'],
      default: 'en'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    layout: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    },
    
    // Notification preferences
    notifications: {
      email: {
        newArticles: { type: Boolean, default: true },
        breakingNews: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: true },
        comments: { type: Boolean, default: false }
      },
      push: {
        newArticles: { type: Boolean, default: false },
        breakingNews: { type: Boolean, default: true },
        comments: { type: Boolean, default: false }
      },
      inApp: {
        newArticles: { type: Boolean, default: true },
        breakingNews: { type: Boolean, default: true },
        comments: { type: Boolean, default: true }
      }
    },
    
    // Privacy preferences
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      },
      showReadingHistory: { type: Boolean, default: true },
      showBookmarks: { type: Boolean, default: false },
      allowDataCollection: { type: Boolean, default: true }
    },
    
    // Reading preferences
    reading: {
      autoSaveProgress: { type: Boolean, default: true },
      showReadingTime: { type: Boolean, default: true },
      enableHighlights: { type: Boolean, default: false },
      defaultView: {
        type: String,
        enum: ['list', 'grid', 'magazine'],
        default: 'list'
      }
    },
    
    // Social preferences
    social: {
      allowComments: { type: Boolean, default: true },
      allowShares: { type: Boolean, default: true },
      showSocialButtons: { type: Boolean, default: true },
      autoShare: { type: Boolean, default: false }
    }
  },
  
  // Custom preferences (key-value pairs for extensibility)
  customPreferences: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userPreferenceSchema.index({ userId: 1 });
userPreferenceSchema.index({ 'preferences.categories': 1 });
userPreferenceSchema.index({ 'preferences.tags': 1 });

// Method to update preferences
userPreferenceSchema.methods.updatePreferences = function(updates) {
  const allowedPaths = [
    'preferences.categories',
    'preferences.tags',
    'preferences.authors',
    'preferences.theme',
    'preferences.language',
    'preferences.fontSize',
    'preferences.layout',
    'preferences.notifications',
    'preferences.privacy',
    'preferences.reading',
    'preferences.social',
    'customPreferences'
  ];

  for (const [path, value] of Object.entries(updates)) {
    if (allowedPaths.includes(path)) {
      this.set(path, value);
    }
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to get user's content recommendations
userPreferenceSchema.methods.getRecommendationCriteria = function() {
  return {
    categories: this.preferences.categories,
    tags: this.preferences.tags,
    authors: this.preferences.authors,
    language: this.preferences.language
  };
};

// Static method to get users with similar preferences
userPreferenceSchema.statics.getSimilarUsers = async function(userId, limit = 10) {
  const userPrefs = await this.findOne({ userId });
  if (!userPrefs) return [];

  const pipeline = [
    { $match: { userId: { $ne: new mongoose.Types.ObjectId(userId) } } },
    {
      $addFields: {
        similarityScore: {
          $add: [
            {
              $size: {
                $setIntersection: ['$preferences.categories', userPrefs.preferences.categories]
              }
            },
            {
              $size: {
                $setIntersection: ['$preferences.tags', userPrefs.preferences.tags]
              }
            },
            {
              $cond: [
                { $eq: ['$preferences.language', userPrefs.preferences.language] },
                1,
                0
              ]
            }
          ]
        }
      }
    },
    { $match: { similarityScore: { $gt: 0 } } },
    { $sort: { similarityScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: 1,
        userName: '$user.name',
        userEmail: '$user.email',
        similarityScore: 1,
        commonCategories: {
          $size: {
            $setIntersection: ['$preferences.categories', userPrefs.preferences.categories]
          }
        },
        commonTags: {
          $size: {
            $setIntersection: ['$preferences.tags', userPrefs.preferences.tags]
          }
        }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Static method to get preference statistics
userPreferenceSchema.statics.getPreferenceStats = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        themeStats: {
          $push: '$preferences.theme'
        },
        languageStats: {
          $push: '$preferences.language'
        },
        categoryStats: {
          $push: '$preferences.categories'
        }
      }
    },
    {
      $project: {
        totalUsers: 1,
        themeDistribution: {
          light: { $size: { $filter: { input: '$themeStats', cond: { $eq: ['$$this', 'light'] } } } },
          dark: { $size: { $filter: { input: '$themeStats', cond: { $eq: ['$$this', 'dark'] } } } },
          auto: { $size: { $filter: { input: '$themeStats', cond: { $eq: ['$$this', 'auto'] } } } }
        },
        languageDistribution: {
          en: { $size: { $filter: { input: '$languageStats', cond: { $eq: ['$$this', 'en'] } } } },
          km: { $size: { $filter: { input: '$languageStats', cond: { $eq: ['$$this', 'km'] } } } }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { totalUsers: 0, themeDistribution: {}, languageDistribution: {} };
};

export default mongoose.model('UserPreference', userPreferenceSchema);
