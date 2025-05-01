import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import PostInteractions from '@/libs/database/models/postInteractions';

export async function POST(req: Request) {
  try {
    const { email, postId } = await req.json();

    if (!email || !postId) {
      return NextResponse.json({ message: 'Email and postId are required', success: false }, { status: 400 });
    }

    await dbConnect();

    const post = await Post.findOne({ postId });
    if (!post) {
      return NextResponse.json({ message: 'Post not found', success: false }, { status: 404 });
    }

    const interaction = await PostInteractions.findOne({ email });

    if (!interaction) {
      return NextResponse.json({ message: 'No interaction found for user', success: false }, { status: 404 });
    }

    const wasLiked = interaction.likedPosts.some(
      (entry: { postId: string }) => entry.postId === postId
    );

    if (!wasLiked) {
      return NextResponse.json({ message: 'Post not liked yet', success: false }, { status: 409 });
    }

    interaction.likedPosts = interaction.likedPosts.filter(
      (entry: { postId: string }) => entry.postId !== postId
    );
    await interaction.save();

    post.likes = Math.max(0, post.likes - 1);
    await post.save({ validateBeforeSave: false }); // ✅ Skip validation here

    return NextResponse.json({ message: 'Post unliked successfully', success: true }, { status: 200 });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
