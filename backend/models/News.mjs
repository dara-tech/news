import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: [true, 'English title is required'] },
      kh: { type: String, required: [true, 'Khmer title is required'] }
    },
    content: {
      en: { type: String, required: [true, 'English content is required'] },
      kh: { type: String, required: [true, 'Khmer content is required'] }
    },
    description: {
      en: { type: String, required: [true, 'English description is required'] },
      kh: { type: String, required: [true, 'Khmer description is required'] }
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    metaDescription: {
      en: { type: String },
      kh: { type: String }
    },
    keywords: {
      type: String,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    tags: [{
      type: String,
      trim: true
    }],
    thumbnail: {
      type: String,
      // required: [true, 'Thumbnail image is required']
    },
    images: [{
      type: String
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: {
      type: Date,
      default: null
    },
    views: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isBreaking: {
      type: Boolean,
      default: false
    },
    // Sentinel/source attribution (optional)
    source: {
      name: { type: String },
      url: { type: String },
      publishedAt: { type: Date },
      guid: { type: String },
    },
    // Ingestion metadata (optional)
    ingestion: {
      method: { type: String }, // e.g., 'sentinel', 'manual'
      model: { type: String },  // e.g., 'gemini-2.0-flash'
      cost: { type: Number },   // estimated token/$ if available
      retries: { type: Number, default: 0 },
    },
    // Data quality assessment (optional)
    qualityAssessment: {
      overallScore: { type: Number, min: 0, max: 100 },
      qualityGrade: { type: String, enum: ['excellent', 'good', 'acceptable', 'poor', 'unacceptable'] },
      factorScores: {
        contentAccuracy: {
          score: { type: Number, min: 0, max: 100 },
          confidence: { type: String, enum: ['low', 'medium', 'high'] }
        },
        sourceReliability: {
          score: { type: Number, min: 0, max: 100 },
          confidence: { type: String, enum: ['low', 'medium', 'high'] }
        },
        contentCompleteness: {
          score: { type: Number, min: 0, max: 100 },
          missingElements: [{ type: String }]
        },
        languageQuality: {
          score: { type: Number, min: 0, max: 100 },
          issues: [{ type: String }]
        },
        relevanceScore: {
          score: { type: Number, min: 0, max: 100 },
          matchedCategories: [{ type: String }]
        },
        uniquenessScore: {
          score: { type: Number, min: 0, max: 100 },
          duplicateFactors: [{ type: String }]
        }
      },
      recommendations: [{
        category: { type: String },
        priority: { type: String, enum: ['low', 'medium', 'high'] },
        suggestion: { type: String },
        impact: { type: String }
      }],
      riskFactors: [{
        level: { type: String, enum: ['low', 'medium', 'high'] },
        factor: { type: String },
        description: { type: String },
        mitigation: { type: String }
      }],
      assessedAt: { type: Date, default: Date.now }
    },

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create slug from title before saving
newsSchema.pre('save', function(next) {
  if (this.isModified('title.en')) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes for better query performance
newsSchema.index({ category: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ isFeatured: 1 });
newsSchema.index({ isBreaking: 1 });

// Text index for search
newsSchema.index({
  'title.en': 'text',
  'content.en': 'text',
  'title.kh': 'text',
  'content.kh': 'text',
  'meta.keywords': 'text'
});

// Unique sparse index to prevent duplicate ingestion by source guid
newsSchema.index({ 'source.guid': 1 }, { unique: true, sparse: true });

// Virtual for formatted date
newsSchema.virtual('formattedDate').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString() : null;
});

const News = mongoose.model('News', newsSchema);

export default News;