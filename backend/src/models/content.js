import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  source: String,
  content: String,
  type: String,
  tags: [String],
  namedEntities: [
    {
      text: String,
      label: String,
    },
  ],
  embedding: {
    type: [Number],
    index: true,
  },
}, {
  timestamps: true
});

ContentSchema.index({ content: 'text', title: 'text' });

export default mongoose.model('Content', ContentSchema);