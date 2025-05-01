import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Follow from '@/libs/database/models/follow';
import Story from '@/libs/database/models/stories';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    const followDoc = await Follow.findOne({ email });
    if (!followDoc) {
      return NextResponse.json(
        { message: 'User not found in Follow schema', success: false },
        { status: 404 }
      );
    }

    const followingEmails = followDoc.following.map((f: any) => f.email);
    const followerEmails = followDoc.followers.map((f: any) => f.email);

    // Merge following and followers emails and remove duplicates
    const allEmails = Array.from(new Set([...followingEmails, ...followerEmails]));

    // Also include the current user's own stories
    allEmails.push(email);

    // Fetch stories for all those emails
    const stories = await Story.find({ email: { $in: allEmails } }).sort({ createdAt: -1 });
    
    return NextResponse.json(
      { message: 'Stories fetched successfully', success: true, data: stories },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
