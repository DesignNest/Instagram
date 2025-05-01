import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import PostInteractions from '@/libs/database/models/postInteractions';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, postId } = body;

    if (!email || !postId) {
      return NextResponse.json(
        { success: false, message: 'Email and postId are required' },
        { status: 400 }
      );
    }

    const interaction = await PostInteractions.findOne({ email });

    if (!interaction) {
      return NextResponse.json(
        { success: false, message: 'No saved posts found for this user' },
        { status: 404 }
      );
    }

    // Filter out the postId from savedPosts
    interaction.savedPosts = interaction.savedPosts.filter((p : any) => p.postId !== postId);
    await interaction.save();

    return NextResponse.json({ success: true, message: 'Post unsaved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error unsaving post:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
