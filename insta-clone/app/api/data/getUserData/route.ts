import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import user from '@/libs/database/models/user';
import post from '@/libs/database/models/post';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required.', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user
    const foundUser = await user.findOne({ email }).select('-password -__v');
    if (!foundUser) {
      return NextResponse.json(
        { message: 'User not found.', success: false },
        { status: 404 }
      );
    }

    // Count posts by this user
    const postCount = await post.countDocuments({ email });

    return NextResponse.json(
      {
        message: 'User found successfully.',
        success: true,
        user: foundUser,
        postCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', success: false },
      { status: 500 }
    );
  }
}
