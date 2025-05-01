import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Follow from '@/libs/database/models/follow';
import User from '@/libs/database/models/user';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    console.log('Fetching follow data for:', email);

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
        { message: 'Follow data not found', success: false },
        { status: 404 }
      );
    }

    const userDoc = await User.findOne({ email }, 'profilePhoto');
    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Extract emails from followers and following lists
    const followerEmails = followDoc.followers.map((user: any) => user.email);
    const followingEmails = followDoc.following.map((user: any) => user.email);

    // Fetch users' profile data (including username and fullName)
    const followerUsers = await User.find(
      { email: { $in: followerEmails } },
      'email profilePhoto username fullName'
    );
    const followingUsers = await User.find(
      { email: { $in: followingEmails } },
      'email profilePhoto username fullName'
    );

    // Merge profile photos, usernames, and fullNames with original follower/following objects
    const followersWithPhotos = followDoc.followers.map((follower: any) => {
      const matchedUser = followerUsers.find((u: any) => u.email === follower.email);
      return {
        ...follower,
        profilePhoto: matchedUser?.profilePhoto || '',
        username: matchedUser?.username || '',
        fullName: matchedUser?.fullName || '',
        email:matchedUser?.email || ''
      };
    });

    const followingWithPhotos = followDoc.following.map((following: any) => {
      const matchedUser = followingUsers.find((u: any) => u.email === following.email);
      return {
        ...following,
        profilePhoto: matchedUser?.profilePhoto || '',
        username: matchedUser?.username || '',
        fullName: matchedUser?.fullName || '',
        email:matchedUser?.email || ''
      };
    });

    return NextResponse.json(
      {
        success: true,
        followers: followersWithPhotos,
        following: followingWithPhotos,
        profilePhoto: userDoc.profilePhoto,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching follow data:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
