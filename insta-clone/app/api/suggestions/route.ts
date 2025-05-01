import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import User from '@/libs/database/models/user';
import Follow from '@/libs/database/models/follow';

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
    const followingEmails = followDoc
      ? followDoc.following.map((f: any) => f.email)
      : [];


    followingEmails.push(email);

 
    const suggestions = await User.find(
      { email: { $nin: followingEmails } },
      'username email profilePhoto'
    )
      .limit(4)
      .lean();

    return NextResponse.json(
      {
        message: 'Suggestions fetched',
        success: true,
        suggestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Suggestion fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
