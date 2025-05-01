import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import user from '@/libs/database/models/user';

export async function GET() {
  try {
    await dbConnect();

    const users = await user.find({}, 'username email profilePhoto fullName').lean();

    return NextResponse.json(
      {
        message: 'Users fetched successfully',
        success: true,
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch users',
        success: false,
      },
      { status: 500 }
    );
  }
}
