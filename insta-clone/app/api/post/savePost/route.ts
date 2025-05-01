import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import PostInteractions from '@/libs/database/models/postInteractions';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email, postId, username } = body;

    if (!email || !postId || !username) {
      return NextResponse.json(
        { success: false, message: 'Email, postId, and username are required' },
        { status: 400 }
      );
    }

    // Check if interaction doc exists
    let interaction = await PostInteractions.findOne({ email });

    if (!interaction) {
      // Create new doc
      interaction = await PostInteractions.create({
        email,
        username,
        savedPosts: [{ postId }],
        likedPosts: [],
      });
    } else {
      // Check if already saved
      const alreadySaved = interaction.savedPosts.some((p : any) => p.postId === postId);

      if (!alreadySaved) {
        interaction.savedPosts.push({ postId });
        await interaction.save();
      }
    }

    return NextResponse.json({ success: true, message: 'Post saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
