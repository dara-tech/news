import mongoose from 'mongoose';

const userBookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true,
    index: true
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'favorites', 'read_later', 'research', 'custom']
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes
userBookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });
userBookmarkSchema.index({ userId: 1, category: 1, createdAt: -1 });
userBookmarkSchema.index({ userId: 1, createdAt: -1 });

// Virtual for bookmark age
userBookmarkSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Static method to get user bookmarks
userBookmarkSchema.statics.getUserBookmarks = async function(userId, options = {}) {
  const {
    category = null,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { userId: new mongoose.Types.ObjectId(userId) };
  if (category) {
    query.category = category;
  }

  const sort = { [sortBy]: sortOrder };

  return await this.find(query)
    .populate('articleId', 'title description thumbnail publishedAt views category author')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method to get bookmark statistics
userBookmarkSchema.statics.getBookmarkStats = async function(userId) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        totalBookmarks: { $sum: '$count' },
        categories: {
          $push: {
            category: '$_id',
            count: '$count'
          }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { totalBookmarks: 0, categories: [] };
};

export default mongoose.model('UserBookmark', userBookmarkSchema);
