import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import { cloudinary } from '@/libs/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const {
      email,
      username,
      postTitle,
      postPhoto,
      profilePhoto
    } = await req.json();

    if (!email || !username || !postTitle || !postPhoto) {
      return NextResponse.json(
        { message: 'All fields are required', success: false },
        { status: 400 }
      );
    }

    await dbConnect();

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(postPhoto, {
      folder: 'posts',
      public_id: `post_${uuidv4()}`,
    });

    // Generate unique post ID
    const postId = uuidv4();

    const newPost = await Post.create({
      postId,
      email,
      username,
      postTitle,
      postPhoto: uploadResult.secure_url,
      likes: 0,
      profilePhoto,
      dateUploaded: new Date(),
      comments: [], // Optional, default can be set in schema too
    });

    return NextResponse.json(
      { message: 'Post created successfully', success: true, post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', success: false },
      { status: 500 }
    );
  }
}
