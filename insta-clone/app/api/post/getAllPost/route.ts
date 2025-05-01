import { NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import User from '@/libs/database/models/user';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all posts
    const posts = await Post.find({})
      .sort({ dateUploaded: -1 })
      .lean();

    // Get all unique emails from posts
    const emails = [...new Set(posts.map(post => post.email))];

    // Fetch users' profile photos
    const users = await User.find({ email: { $in: emails } }, 'email profilePhoto').lean();
    const photoMap = Object.fromEntries(users.map(user => [user.email, user.profilePhoto]));

    // Inject up-to-date profile photos
    const enrichedPosts = posts.map(post => ({
      ...post,
      profilePhoto: photoMap[post.email] || post.profilePhoto // fallback if user deleted
    }));

    return NextResponse.json({ success: true, posts: enrichedPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
