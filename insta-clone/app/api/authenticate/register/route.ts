import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/libs/database/dbConnect';
import user from '@/libs/database/models/user';
import Chat from '@/libs/database/models/chat';
import Follow from '@/libs/database/models/follow';
import Notification from '@/libs/database/models/notification';
import PostInteractions from '@/libs/database/models/postInteractions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, username, password } = body;

    if (!fullName || !email || !username || !password) {
      return NextResponse.json(
        { message: 'All fields are required.', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    const [existingEmail, existingUsername] = await Promise.all([
      user.findOne({ email }),
      user.findOne({ username }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists.', success: false },
        { status: 409 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username already exists.', success: false },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      fullName,
      email,
      username,
      password: hashedPassword,
    });

    const credentials = {
      _id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      profilePhoto: newUser.profilePhoto,
      followers: newUser.followers,
      following: newUser.following,
      description: newUser.description,
    };

    const token = jwt.sign(credentials, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    newUser.token = token;
    await newUser.save();

    // Initialize related schemas
    await Promise.all([
      Chat.create({
        email: newUser.email,
        username: newUser.username,
        profilePhoto: newUser.profilePhoto,
        friends: [],
      }),
      Follow.create({
        email: newUser.email,
        following: [],
        followers: [],
      }),
      Notification.create({
        email: newUser.email,
        username: newUser.username,
        likeNotifications: [],
        commentNotifications: [],
        followNotifications: [],
      }),
      PostInteractions.create({
        email: newUser.email,
        username: newUser.username,
        likedPosts: [],
        savedPosts: [],
      }),
    ]);

    const response = NextResponse.json(
      { message: 'Successfully Registered', success: true },
      { status: 201 }
    );

    response.cookies.set('credentials', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Error in register route:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', success: false },
      { status: 500 }
    );
  }
}
