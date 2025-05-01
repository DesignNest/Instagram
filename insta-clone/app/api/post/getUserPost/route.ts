import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/libs/database/dbConnect';
import Post from '@/libs/database/models/post';
import User from '@/libs/database/models/user';

interface Reply {
  senderEmail: string;
  senderUsername: string;
  senderProfilePhoto: string;
  replyText: string;
  dateReplied: Date;
}

interface Comment {
  commentTitle: string;
  commentId: string;
  commentText: string;
  senderEmail: string;
  senderUsername: string;
  senderProfilePhoto: string;
  dateCommented: Date;
  replies: Reply[];
}

interface IPost {
  postId: string;
  email: string;
  username: string;
  postTitle: string;
  postPhoto: string;
  likes: number;
  profilePhoto: string;
  dateUploaded: Date;
  comments: Comment[];
}

interface IUser {
  email: string;
  profilePhoto: string;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Fetch posts by user email
    const posts = await Post.find({ email }).sort({ dateUploaded: -1 }).lean<IPost[]>();

    // Fetch user for latest profile photo
    const user = await User.findOne({ email }, 'profilePhoto').lean<IUser | null>();
    const updatedProfilePhoto = user?.profilePhoto;

    const enrichedPosts = posts.map(post => ({
      ...post,
      profilePhoto: updatedProfilePhoto || post.profilePhoto, // fallback
    }));

    return NextResponse.json({ success: true, posts: enrichedPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
