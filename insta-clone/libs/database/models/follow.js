import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    following: [
      {
        username: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
    followers: [
      {
        username: { type: String, required: true },
        email: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Follow || mongoose.model('Follow', followSchema);
