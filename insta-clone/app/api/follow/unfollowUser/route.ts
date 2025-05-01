import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Follow from '@/libs/database/models/follow';
import User from '@/libs/database/models/user';

export async function POST(req: Request) {
  try {
    const {
      followerEmail,
      followingEmail,
    } = await req.json();

    if (!followerEmail || !followingEmail) {
      return NextResponse.json({ message: 'Missing required fields', success: false }, { status: 400 });
    }

    await dbConnect();

    const followerDoc = await Follow.findOne({ email: followerEmail });
    const followingDoc = await Follow.findOne({ email: followingEmail });

    if (!followerDoc || !followingDoc) {
      return NextResponse.json({ message: 'Follow records not found', success: false }, { status: 404 });
    }

    // Remove from follower's following list
    followerDoc.following = followerDoc.following.filter((f:any) => f.email !== followingEmail);

    // Remove from following's followers list
    followingDoc.followers = followingDoc.followers.filter((f:any) => f.email !== followerEmail);

    await followerDoc.save();
    await followingDoc.save();

    // Decrement counts in User schema
    await User.updateOne({ email: followerEmail }, { $inc: { following: -1 } });
    await User.updateOne({ email: followingEmail }, { $inc: { followers: -1 } });

    return NextResponse.json({ message: 'Unfollowed successfully', success: true }, { status: 200 });
  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
  }
}
