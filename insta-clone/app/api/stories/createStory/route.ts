import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Story from '@/libs/database/models/stories';
import User from '@/libs/database/models/user';
import { cloudinary } from '@/libs/cloudinary'; 

export async function POST(req: Request) {
  try {
    const { email, storyPhoto } = await req.json();

    if (!email || !storyPhoto) {
      return NextResponse.json(
        { message: 'Email and story photo are required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

   
    const uploadRes = await cloudinary.uploader.upload(storyPhoto, {
      folder: 'stories', 
      public_id: `story_${user._id}_${Date.now()}`,
      overwrite: true,
    });


    const newStory = await Story.create({
      email: user.email,
      username: user.username,
      profilePhoto: user.profilePhoto,
      storyPhoto: uploadRes.secure_url, 
    });

    return NextResponse.json(
      { message: 'Story created successfully', success: true, data: newStory },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', success: false },
      { status: 500 }
    );
  }
}
