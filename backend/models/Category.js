import mongoose from 'mongoose';

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
