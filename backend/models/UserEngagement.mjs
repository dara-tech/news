import mongoose from 'mongoose';

const userEngagementSchema = new mongoose.Schema({
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
  action: {
    type: String,
    enum: ['view', 'like', 'share', 'bookmark', 'comment', 'read_complete'],
    required: true,
    index: true
  },
  metadata: {
    readTime: { type: Number, default: 0 }, // Time spent reading in seconds
    scrollDepth: { type: Number, default: 0 }, // Percentage of article scrolled
    device: { type: String },
    browser: { type: String },
    referrer: { type: String },
    sessionId: { type: String }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
userEngagementSchema.index({ userId: 1, articleId: 1, action: 1 });
userEngagementSchema.index({ articleId: 1, action: 1, timestamp: -1 });
userEngagementSchema.index({ userId: 1, timestamp: -1 });
userEngagementSchema.index({ action: 1, timestamp: -1 });

// Virtual for engagement score
userEngagementSchema.virtual('engagementScore').get(function() {
  const scores = {
    view: 1,
    like: 3,
    share: 5,
    bookmark: 2,
    comment: 4,
    read_complete: 6
  };
  return scores[this.action] || 0;
});

// Static method to get user engagement summary
userEngagementSchema.statics.getUserEngagementSummary = async function(userId, timeRange = '30d') {
  const timeFilter = this.getTimeFilter(timeRange);
  
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId), ...timeFilter } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalScore: { $sum: '$engagementScore' }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Static method to get article engagement summary
userEngagementSchema.statics.getArticleEngagementSummary = async function(articleId, timeRange = '30d') {
  const timeFilter = this.getTimeFilter(timeRange);
  
  const pipeline = [
    { $match: { articleId: new mongoose.Types.ObjectId(articleId), ...timeFilter } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalScore: { $sum: '$engagementScore' }
      }
    }
  ];

  return await this.aggregate(pipeline);
};

// Static method to get trending articles based on engagement
userEngagementSchema.statics.getTrendingArticles = async function(timeRange = '7d', limit = 10) {
  const timeFilter = this.getTimeFilter(timeRange);
  
  const pipeline = [
    { $match: timeFilter },
    {
      $group: {
        _id: '$articleId',
        totalEngagement: { $sum: '$engagementScore' },
        totalActions: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $lookup: {
        from: 'news',
        localField: '_id',
        foreignField: '_id',
        as: 'article'
      }
    },
    { $unwind: '$article' },
    {
      $project: {
        articleId: '$_id',
        title: '$article.title.en',
        views: '$article.views',
        totalEngagement: 1,
        totalActions: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        engagementRate: {
          $cond: [
            { $gt: ['$article.views', 0] },
            { $divide: ['$totalEngagement', '$article.views'] },
            0
          ]
        }
      }
    },
    { $sort: { totalEngagement: -1 } },
    { $limit: limit }
  ];

  return await this.aggregate(pipeline);
};

// Helper method to get time filter
userEngagementSchema.statics.getTimeFilter = function(timeRange) {
  const now = new Date();
  let startDate;

  switch (timeRange) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return {
    timestamp: { $gte: startDate, $lte: now }
  };
};

export default mongoose.model('UserEngagement', userEngagementSchema);
