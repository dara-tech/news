import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true, unique: true },
    kh: { type: String, required: true, trim: true, unique: true },
  },
  slug: {
    en: { type: String, required: true, unique: true, lowercase: true, trim: true },
    kh: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  description: {
    en: { type: String, trim: true },
    kh: { type: String, trim: true },
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });

// Pre-save hook to generate slugs from names if not provided
categorySchema.pre('validate', function(next) {
  // Generate English slug if the document is new or the English name has been modified
  if (this.isNew || this.isModified('name.en')) {
    this.slug.en = this.name.en.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  
  // Generate Khmer slug if the document is new or the Khmer name has been modified
  if (this.isNew || this.isModified('name.kh')) {
    // For Khmer, we'll use a transliteration approach or fallback to English slug
    // For now, we'll use a simple approach: convert to English slug format
    this.slug.kh = this.name.kh.toLowerCase()
      .replace(/[\u1780-\u17FF]/g, 'kh') // Replace Khmer characters with 'kh'
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }
  
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
