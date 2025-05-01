import mongoose from 'mongoose';

const postInteractionsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    likedPosts: [
      {
        postId: {
          type: String,
          required: true,
        },
      },
    ],
    savedPosts: [
      {
        postId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const PostInteractions =
  mongoose.models.PostInteractions ||
  mongoose.model('PostInteractions', postInteractionsSchema);

export default PostInteractions;
