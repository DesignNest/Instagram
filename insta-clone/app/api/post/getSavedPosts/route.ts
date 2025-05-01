import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import PostInteractions from '@/libs/database/models/postInteractions';

interface EnrichedPost {
  saved: boolean;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Step 1: Get saved post IDs from PostInteractions
    const interactions = await PostInteractions.findOne({ email }).lean();

    if (!interactions || !interactions.savedPosts?.length) {
      return NextResponse.json({ success: true, posts: [] }, { status: 200 });
    }

    const savedPostIds = interactions.savedPosts.map((p) => p.postId);

    // Step 2: Fetch full post details using the post IDs
    const savedPosts = await Post.find({ postId: { $in: savedPostIds } }).lean();

    // Step 3: Mark each as saved and return enriched data
    const enrichedPosts: EnrichedPost[] = savedPosts.map((post) => ({
      ...post,
      saved: true,
    }));

    return NextResponse.json({ success: true, posts: enrichedPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
