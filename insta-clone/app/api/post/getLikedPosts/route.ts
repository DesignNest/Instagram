import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import PostInteractions from '@/libs/database/models/postInteractions';

interface EnrichedPost {
  liked: boolean;
  [key: string]: any; // Allow any other post fields
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Step 1: Get liked post IDs from PostInteractions
    const interactions = await PostInteractions.findOne({ email }).lean();

    if (!interactions || !interactions.likedPosts?.length) {
      return NextResponse.json({ success: true, posts: [] }, { status: 200 });
    }

    const likedPostIds = interactions.likedPosts.map((p) => p.postId);

    // Step 2: Fetch full post details using the post IDs
    const likedPosts = await Post.find({ postId: { $in: likedPostIds } }).lean();

    // Step 3: Mark each as liked and return enriched data
    const enrichedPosts: EnrichedPost[] = likedPosts.map((post) => ({
      ...post,
      liked: true,
    }));

    return NextResponse.json({ success: true, posts: enrichedPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
