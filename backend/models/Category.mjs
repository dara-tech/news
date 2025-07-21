import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true, unique: true },
    kh: { type: String, required: true, trim: true, unique: true },
  },
  slug: { 
    
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
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

// Pre-save hook to generate slug from the English name if not provided
categorySchema.pre('validate', function(next) {
  // Generate a slug from the English name if the document is new or the name has been modified.
  if (this.isNew || this.isModified('name.en')) {
    this.slug = this.name.en.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
