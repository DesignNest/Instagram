import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import PostInteractions from '@/libs/database/models/postInteractions';

export async function POST(req: Request) {
  try {
    const { email, postId } = await req.json();

    if (!email || !postId) {
      return NextResponse.json(
        { message: 'Email and postId are required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if postId exists in savedPosts array
    const interaction = await PostInteractions.findOne({
      email,
      savedPosts: { $elemMatch: { postId } },
    });

    const isSaved = !!interaction;

    return NextResponse.json({ saved: isSaved, success: true }, { status: 200 });
  } catch (error) {
    console.error('Error checking save status:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
