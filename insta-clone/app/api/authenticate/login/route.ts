import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/libs/database/dbConnect';
import user from '@/libs/database/models/user';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.', success: false },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return NextResponse.json(
        { message: 'Invalid email or password.', success: false },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password.', success: false },
        { status: 401 }
      );
    }

    const credentials = {
      _id: existingUser._id.toString(),
      username: existingUser.username,
      email: existingUser.email,
      fullName: existingUser.fullName,
      profilePhoto: existingUser.profilePhoto,
      followers: existingUser.followers,
      following: existingUser.following,
      description: existingUser.description
    };

    const token = jwt.sign(credentials, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });

    existingUser.token = token;
    await existingUser.save();

    const response = NextResponse.json(
      { message: 'Login successful', success: true },
      { status: 200 }
    );

    response.cookies.set('credentials', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', success: false },
      { status: 500 }
    );
  }
}
