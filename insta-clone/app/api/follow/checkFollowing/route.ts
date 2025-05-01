import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Follow from '@/libs/database/models/follow';

export async function POST(req: Request) {
  try {
    const { currentUserEmail, otherUserEmail } = await req.json();

    if (!currentUserEmail || !otherUserEmail) {
      return NextResponse.json({ message: 'Both emails are required', success: false }, { status: 400 });
    }

    await dbConnect();

    const currentUserFollowDoc = await Follow.findOne({ email: currentUserEmail });
    const otherUserFollowDoc = await Follow.findOne({ email: otherUserEmail });

    if (!currentUserFollowDoc || !otherUserFollowDoc) {
      return NextResponse.json({ message: 'Follow data not found', success: false }, { status: 404 });
    }

    const isFollowing = currentUserFollowDoc.following.some((f: { email: any; }) => f.email === otherUserEmail);
    const isFollowedBy = currentUserFollowDoc.followers.some((f: { email: any; }) => f.email === otherUserEmail);

    let message = 'Follow';
    if (isFollowing) {
      message = 'Following';
    } else if (isFollowedBy) {
      message = 'Follow Back';
    }

    return NextResponse.json({
      isFollowing,
      message,
      success: true,
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
