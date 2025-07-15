import mongoose from 'mongoose';

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
    meta: {
      description: {
        en: { type: String },
        kh: { type: String }
      },
      keywords: [{
        en: { type: String },
        kh: { type: String }
      }]
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['politics', 'business', 'technology', 'health', 'sports', 'entertainment', 'education', 'other']
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
    meta: {
      title: {
        en: String,
        kh: String
      },
      description: {
        en: String,
        kh: String
      },
      keywords: [String]
    }
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

// Virtual for formatted date
newsSchema.virtual('formattedDate').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString() : null;
});

const News = mongoose.model('News', newsSchema);

export default News;