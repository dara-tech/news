import mongoose from 'mongoose';

const saveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index to ensure one save per user per article
saveSchema.index({ user: 1, article: 1 }, { unique: true });

// Add virtual for save count
saveSchema.virtual('saveCount', {
  ref: 'Save',
  localField: 'article',
  foreignField: 'article',
  count: true
});

// Ensure virtual fields are serialized
saveSchema.set('toJSON', { virtuals: true });

const Save = mongoose.model('Save', saveSchema);

export default Save;
