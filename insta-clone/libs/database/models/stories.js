import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      required: true,
    },
    storyPhoto: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Story || mongoose.model('Story', storySchema);
